import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from google import genai
from datetime import datetime
import database as db
from PIL import Image
import json
import io
from fpdf import FPDF
from streamlit_option_menu import option_menu
from streamlit_extras.metric_cards import style_metric_cards
import os

# --- Page Config ---
st.set_page_config(
    page_title="Vimanasa Nexus | Enterprise Suite",
    page_icon="🏢",
    layout="wide",
)

# --- PDF Generation Helper ---
class SalarySlip(FPDF):
    def header(self):
        # Using the logo in PDF if available
        try: self.image("assets/vimanasa_logo.png", 10, 8, 33)
        except: pass
        self.set_font('Arial', 'B', 15)
        self.cell(80)
        self.cell(30, 10, 'VIMANASA SERVICES LLP', 0, 0, 'C')
        self.ln(20)

    def generate(self, data):
        self.add_page()
        self.set_font('Arial', 'B', 12)
        self.cell(0, 10, f'Salary Slip for {data["Month"]} {data["Year"]}', 0, 1, 'C')
        self.ln(5)
        
        # Employee Info
        self.set_font('Arial', '', 10)
        self.cell(0, 10, f'Employee Name: {data["Employee_Name"]}', 0, 1)
        self.cell(0, 10, f'Record ID: {data["Record_ID"]}', 0, 1)
        self.cell(0, 10, f'Days Worked: {data["Days_Worked"]}', 0, 1)
        self.ln(5)
        
        # Financials
        self.set_font('Arial', 'B', 10)
        self.cell(100, 10, 'Earnings', 1)
        self.cell(90, 10, 'Amount (INR)', 1, 1)
        
        self.set_font('Arial', '', 10)
        self.cell(100, 10, 'Base Salary', 1)
        self.cell(90, 10, f'{data["Base_Salary"]}', 1, 1)
        
        self.ln(5)
        self.set_font('Arial', 'B', 10)
        self.cell(100, 10, 'Deductions', 1)
        self.cell(90, 10, 'Amount (INR)', 1, 1)
        
        self.set_font('Arial', '', 10)
        self.cell(100, 10, 'EPF (12%)', 1)
        self.cell(90, 10, f'{data["EPF"]}', 1, 1)
        self.cell(100, 10, 'Professional Tax', 1)
        self.cell(90, 10, f'{data["PT"]}', 1, 1)
        
        self.ln(5)
        self.set_font('Arial', 'B', 12)
        self.cell(100, 10, 'NET PAYABLE', 1)
        self.cell(90, 10, f'INR {data["Net_Pay"]}', 1, 1)
        
        return self.output(dest='S').encode('latin-1')

# --- Custom CSS ---
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap');
    * { font-family: 'Outfit', sans-serif; }
    .main { background-color: #f4f7f6; }
    .main-header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 2.5rem; border-radius: 20px; color: white; margin-bottom: 2rem; }
    .stMetric { background: white !important; border-radius: 15px !important; padding: 15px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.05) !important; }
    </style>
    """, unsafe_allow_html=True)

# --- Authentication ---
def login():
    # Hide Streamlit default elements for cleaner login page
    st.markdown("""
        <style>
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        header {visibility: hidden;}
        
        /* Login Container Styles */
        .login-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 85vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 24px;
            margin: 1rem;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            position: relative;
            overflow: hidden;
        }
        
        /* Animated background circles */
        .login-wrapper::before {
            content: '';
            position: absolute;
            width: 300px;
            height: 300px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            top: -100px;
            right: -100px;
            animation: float 6s ease-in-out infinite;
        }
        
        .login-wrapper::after {
            content: '';
            position: absolute;
            width: 200px;
            height: 200px;
            background: rgba(255,255,255,0.1);
            border-radius: 50%;
            bottom: -50px;
            left: -50px;
            animation: float 8s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        
        .login-card {
            background: white;
            padding: 3rem 2.5rem;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.15);
            width: 100%;
            max-width: 440px;
            text-align: center;
            position: relative;
            z-index: 1;
            animation: slideUp 0.6s ease-out;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .login-logo-container {
            margin-bottom: 2rem;
            animation: fadeIn 0.8s ease-out;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .login-title {
            font-size: 2rem;
            font-weight: 700;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.5rem;
            letter-spacing: -0.5px;
        }
        
        .login-subtitle {
            font-size: 1rem;
            color: #64748b;
            margin-bottom: 2.5rem;
            font-weight: 400;
        }
        
        /* Input Field Styles */
        .stTextInput > div > div > input {
            border-radius: 12px !important;
            border: 2px solid #e2e8f0 !important;
            padding: 14px 18px !important;
            font-size: 1rem !important;
            transition: all 0.3s ease !important;
            background: #f8fafc !important;
        }
        
        .stTextInput > div > div > input:focus {
            border-color: #667eea !important;
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1) !important;
            background: white !important;
        }
        
        .stTextInput > label {
            font-size: 0.9rem !important;
            font-weight: 600 !important;
            color: #334155 !important;
            margin-bottom: 0.5rem !important;
        }
        
        /* Button Styles */
        .stButton > button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            border: none !important;
            border-radius: 12px !important;
            padding: 14px 24px !important;
            font-size: 1.05rem !important;
            font-weight: 600 !important;
            width: 100% !important;
            transition: all 0.3s ease !important;
            margin-top: 1.5rem !important;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4) !important;
        }
        
        .stButton > button:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5) !important;
        }
        
        .stButton > button:active {
            transform: translateY(0px) !important;
        }
        
        /* Checkbox Styles */
        .stCheckbox {
            font-size: 0.9rem !important;
        }
        
        .security-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
            padding: 10px 20px;
            border-radius: 24px;
            font-size: 0.85rem;
            color: #475569;
            margin-top: 2rem;
            font-weight: 500;
        }
        
        .login-footer {
            margin-top: 2rem;
            font-size: 0.85rem;
            color: #94a3b8;
            font-weight: 400;
        }
        
        .forgot-password {
            text-align: right;
            padding-top: 4px;
        }
        
        .forgot-password a {
            color: #667eea;
            text-decoration: none;
            font-size: 0.9rem;
            font-weight: 500;
            transition: color 0.3s ease;
        }
        
        .forgot-password a:hover {
            color: #764ba2;
        }
        
        /* Error message styling */
        .stAlert {
            border-radius: 12px !important;
            margin-top: 1rem !important;
        }
        
        .input-spacing {
            height: 1.2rem;
        }
        </style>
    """, unsafe_allow_html=True)
    
    # Login Container
    st.markdown('<div class="login-wrapper">', unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 2.5, 1])
    with col2:
        st.markdown('<div class="login-card">', unsafe_allow_html=True)
        
        # Logo
        st.markdown('<div class="login-logo-container">', unsafe_allow_html=True)
        if os.path.exists("assets/vimanasa_logo.png"):
            try:
                st.image("assets/vimanasa_logo.png", width="stretch")
            except:
                st.markdown('<div style="font-size: 4rem; margin-bottom: 1rem;">🏢</div>', unsafe_allow_html=True)
        else:
            st.markdown('<div style="font-size: 4rem; margin-bottom: 1rem;">🏢</div>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)
        
        # Title and Subtitle
        st.markdown('<div class="login-title">Welcome Back</div>', unsafe_allow_html=True)
        st.markdown('<div class="login-subtitle">Sign in to access Vimanasa Nexus Command Center</div>', unsafe_allow_html=True)
        
        # Login Form
        with st.form("login", clear_on_submit=False):
            username = st.text_input("Username", placeholder="Enter your username", key="username_input")
            st.markdown('<div class="input-spacing"></div>', unsafe_allow_html=True)
            password = st.text_input("Password", type="password", placeholder="Enter your password", key="password_input")
            
            # Remember me and Forgot password
            col_a, col_b = st.columns([1, 1])
            with col_a:
                remember = st.checkbox("Remember me", value=False)
            with col_b:
                st.markdown('<div class="forgot-password"><a href="#" onclick="return false;">Forgot password?</a></div>', unsafe_allow_html=True)
            
            # Submit Button
            submit = st.form_submit_button("Sign In to Dashboard", width="stretch")
            
            if submit:
                if username == st.secrets["auth"]["admin_user"] and password == st.secrets["auth"]["admin_password"]:
                    st.session_state["authenticated"] = True
                    st.session_state["username"] = username
                    st.success("✅ Authentication successful! Redirecting to dashboard...")
                    st.rerun()
                else:
                    st.error("❌ Invalid credentials. Please check your username and password.")
        
        # Security Badge
        st.markdown('''
            <div class="security-badge">
                🔒 Secure Login • 256-bit SSL Encryption
            </div>
        ''', unsafe_allow_html=True)
        
        # Footer
        st.markdown('<div class="login-footer">© 2026 Vimanasa Services LLP. All rights reserved.</div>', unsafe_allow_html=True)
        
        st.markdown('</div>', unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)

if "authenticated" not in st.session_state:
    login(); st.stop()

# --- Initialize AI ---
client = genai.Client(api_key=st.secrets["gemini"]["api_key"])

# --- DATA STATE ---
def get_all_data():
    headers = {
        "employees": ["ID", "Name", "Phone", "Aadhaar", "PAN", "Bank_Account", "IFSC", "Role", "Base_Salary", "Status", "Skills", "Assets"],
        "clients": ["Client_ID", "Client_Name", "Industry", "Contact_Person", "Email", "Management_Fee_Pct"],
        "deployments": ["Deployment_ID", "Employee_Name", "Client_Name", "Start_Date", "Site_Role"],
        "attendance": ["Record_ID", "Employee_Name", "Month", "Year", "Days_Worked", "Base_Salary", "EPF", "ESIC", "PT", "TDS", "Net_Pay"]
    }
    for s_name, h_cols in headers.items():
        if f"df_{s_name}" not in st.session_state:
            df = db.load_data(s_name.capitalize())
            st.session_state[f"df_{s_name}"] = df if not df.empty else pd.DataFrame(columns=h_cols)
    return {s: st.session_state[f"df_{s}"] for s in headers.keys()}

data = get_all_data()

# --- Sidebar ---
with st.sidebar:
    try: st.image("assets/vimanasa_logo.png", width="stretch")
    except: st.title("🏢 Vimanasa")
    st.write("")
    selected = option_menu(
        menu_title=None,
        options=["Dashboard", "Workforce", "Partners", "Payroll", "Finance", "Compliance", "AI Assistant"],
        icons=["speedometer2", "people", "building", "cash-stack", "wallet2", "shield-check", "robot"],
        default_index=0
    )
    if st.button("🔄 Cloud Sync", width="stretch"):
        for key in [k for k in st.session_state.keys() if k.startswith("df_")]: del st.session_state[key]
        st.rerun()
    if st.button("🚪 Logout"): del st.session_state["authenticated"]; st.rerun()

# --- MODULES ---

if selected == "Dashboard":
    st.markdown(f"<div class='main-header'><h1>Nexus Command Center</h1><p>{datetime.now().strftime('%A, %d %B %Y')}</p></div>", unsafe_allow_html=True)
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Active Workforce", len(data['employees']))
    c2.metric("Site Deployments", len(data['deployments']))
    c3.metric("Partner Network", len(data['clients']))
    payout = data['attendance']['Net_Pay'].sum() if not data['attendance'].empty else 0
    c4.metric("Total Payout", f"₹{payout/1000:,.1f}K")
    style_metric_cards()
    
    col_l, col_r = st.columns([2, 1])
    with col_l:
        st.subheader("📊 Deployment Distribution")
        if not data['deployments'].empty:
            fig = px.pie(data['deployments'], names='Client_Name', hole=0.5, color_discrete_sequence=px.colors.qualitative.Prism)
            st.plotly_chart(fig, width='stretch')
    with col_r:
        st.subheader("🔔 Operational Feed")
        if not data['employees'].empty:
            for n in data['employees'].tail(5)['Name']: st.info(f"👤 New Onboarding: {n}")

elif selected == "Workforce":
    st.title("👤 Workforce Management")
    t1, t2, t3, t4 = st.tabs(["✨ AI Onboarding", "📁 Master Registry", "🛠️ Asset Tracking", "🎯 Skill Matrix"])
    
    with t1:
        st.subheader("Smart Document OCR Onboarding")
        uploaded = st.file_uploader("Scan Identity (Aadhaar/PAN)", type=['jpg','png','jpeg'])
        ocr = {}
        if uploaded:
            with st.spinner("AI analyzing document..."):
                img = Image.open(uploaded)
                resp = client.models.generate_content(model="gemini-1.5-flash", contents=["Extract Name, ID No, DOB as JSON", img])
                try: ocr = json.loads(resp.text.strip('`json\n '))
                except: st.error("OCR Failed")
        
        with st.form("onb"):
            n = st.text_input("Name", value=ocr.get('name',''))
            p = st.text_input("Phone")
            s = st.number_input("Base Salary", min_value=0)
            if st.form_submit_button("Register Employee", width="stretch"):
                eid = f"EMP{datetime.now().strftime('%M%S')}"
                row = [eid, n, p, ocr.get('id',''), "", "", "", "Staff", s, "Active", "", "None"]
                if db.add_data("Employees", row):
                    st.session_state.df_employees = pd.concat([st.session_state.df_employees, pd.DataFrame([row], columns=st.session_state.df_employees.columns)], ignore_index=True)
                    st.success("Employee Added!"); st.rerun()

    with t2:
        edited = st.data_editor(st.session_state.df_employees, width='stretch', hide_index=True)
        if st.button("Sync Registry to Cloud"):
            if db.update_data("Employees", edited): st.session_state.df_employees = edited; st.success("Cloud Updated")

    with t3:
        st.subheader("Company Assets Issued")
        asset_df = st.session_state.df_employees[['ID', 'Name', 'Assets']]
        edited_assets = st.data_editor(asset_df, width='stretch', hide_index=True)
        if st.button("Update Asset Logs"):
            st.session_state.df_employees.update(edited_assets)
            if db.update_data("Employees", st.session_state.df_employees): st.success("Assets Saved")

    with t4:
        st.subheader("Staff Skill Matrix")
        skill_df = st.session_state.df_employees[['ID', 'Name', 'Skills', 'Role']]
        edited_skills = st.data_editor(skill_df, width='stretch', hide_index=True)
        if st.button("Update Skills"):
            st.session_state.df_employees.update(edited_skills)
            if db.update_data("Employees", st.session_state.df_employees): st.success("Matrix Updated")

elif selected == "Partners":
    st.title("🏢 Partner & Client Hub")
    t1, t2, t3 = st.tabs(["🆕 New Partner", "📂 Partner Directory", "📍 Site Deployment"])
    with t1:
        with st.form("c"):
            cn = st.text_input("Organization Name")
            ind = st.text_input("Industry")
            fee = st.slider("Management Fee %", 0, 20, 10)
            if st.form_submit_button("Register Partner", width="stretch"):
                cid = f"CL{datetime.now().strftime('%M%S')}"
                row = [cid, cn, ind, "Contact", "Email", fee]
                if db.add_data("Clients", row):
                    st.session_state.df_clients = pd.concat([st.session_state.df_clients, pd.DataFrame([row], columns=st.session_state.df_clients.columns)], ignore_index=True)
                    st.success("Partner Registered"); st.rerun()
    with t2:
        st.data_editor(st.session_state.df_clients, width='stretch')
    with t3:
        with st.form("d"):
            e = st.selectbox("Staff", data['employees']['Name'])
            c = st.selectbox("Site", data['clients']['Client_Name'])
            if st.form_submit_button("Deploy to Site"):
                did = f"DEP{datetime.now().strftime('%M%S')}"
                row = [did, e, c, str(datetime.now().date()), "Active Staff"]
                if db.add_data("Deployments", row):
                    st.session_state.df_deployments = pd.concat([st.session_state.df_deployments, pd.DataFrame([row], columns=st.session_state.df_deployments.columns)], ignore_index=True)
                    st.success(f"{e} assigned to {c}"); st.rerun()

elif selected == "Payroll":
    st.title("💰 Payroll Engine")
    t1, t2 = st.tabs(["⚡ Bulk Processing", "📜 Payroll History"])
    
    with t1:
        st.subheader("Process Payroll via Bulk Upload")
        up = st.file_uploader("Upload Attendance CSV (Format: Employee_Name, Days_Worked)", type=['csv'])
        if up:
            df_up = pd.read_csv(up)
            if st.button("Run Bulk Payroll Calculation"):
                processed = 0
                for _, row in df_up.iterrows():
                    emp_match = data['employees'][data['employees']['Name'] == row['Employee_Name']]
                    if not emp_match.empty:
                        base = emp_match.iloc[0]['Base_Salary']
                        days = row['Days_Worked']
                        earned = (base/30)*days
                        ded = (earned*0.12) + (200 if earned>15000 else 0)
                        net = earned - ded
                        pay_row = [f"P{datetime.now().strftime('%M%S%f')[:10]}", row['Employee_Name'], "May", 2026, days, base, earned*0.12, 0, 200, 0, net]
                        db.add_data("Attendance", pay_row)
                        st.session_state.df_attendance = pd.concat([st.session_state.df_attendance, pd.DataFrame([pay_row], columns=st.session_state.df_attendance.columns)], ignore_index=True)
                        processed += 1
                st.success(f"Successfully processed {processed} records!")
                st.rerun()

    with t2:
        st.write("### Download Pay Slips")
        for _, r in st.session_state.df_attendance.iterrows():
            c1, c2 = st.columns([4, 1])
            c1.write(f"📄 {r['Employee_Name']} - {r['Month']} - Net: ₹{r['Net_Pay']:,.2f}")
            pdf = SalarySlip()
            pdf_bytes = pdf.generate(r)
            c2.download_button("Download", pdf_bytes, file_name=f"Slip_{r['Employee_Name']}.pdf", key=r['Record_ID'])

elif selected == "Finance":
    st.title("⚖️ Billing & Financials")
    st.subheader("Partner Invoicing (Drafts)")
    if not data['attendance'].empty and not data['clients'].empty:
        df_billing = pd.merge(st.session_state.df_attendance, st.session_state.df_deployments, on='Employee_Name')
        df_billing = pd.merge(df_billing, st.session_state.df_clients, on='Client_Name')
        
        # Calculate Invoice
        invoice_summary = df_billing.groupby('Client_Name').agg({
            'Net_Pay': 'sum',
            'Management_Fee_Pct': 'first'
        }).reset_index()
        invoice_summary['Management_Fee'] = (invoice_summary['Net_Pay'] * invoice_summary['Management_Fee_Pct']) / 100
        invoice_summary['Total_Invoice'] = invoice_summary['Net_Pay'] + invoice_summary['Management_Fee']
        
        st.dataframe(invoice_summary, width='stretch')
        fig = px.bar(invoice_summary, x='Client_Name', y='Total_Invoice', title="Projected Billing per Site")
        st.plotly_chart(fig, width="stretch")

elif selected == "Compliance":
    st.title("🛡️ Compliance & Audit")
    c1, c2 = st.columns(2)
    with c1:
        st.subheader("KYC Compliance Audit")
        missing_kyc = st.session_state.df_employees[st.session_state.df_employees['Aadhaar'] == ""]
        st.error(f"⚠️ {len(missing_kyc)} Employees missing Aadhaar")
        st.dataframe(missing_kyc[['ID', 'Name', 'Status']])
    with c2:
        st.subheader("Statutory Summary")
        if not data['attendance'].empty:
            total_epf = st.session_state.df_attendance['EPF'].sum()
            st.metric("Total EPF Liability", f"₹{total_epf:,.2f}")

elif selected == "AI Assistant":
    st.title("🤖 Nexus Intelligent Oracle")
    if "msgs" not in st.session_state: st.session_state.msgs = []
    for m in st.session_state.msgs:
        with st.chat_message(m["role"]): st.markdown(m["content"])
    if p := st.chat_input("Query Business Data..."):
        st.session_state.msgs.append({"role": "user", "content": p})
        with st.chat_message("user"): st.markdown(p)
        with st.chat_message("assistant"):
            ctx = f"Emp:{data['employees'].to_string()}\nPay:{data['attendance'].to_string()}"
            resp = client.models.generate_content(model="gemini-1.5-flash", contents=[f"Context:\n{ctx}\n\nQ: {p}"])
            st.markdown(resp.text); st.session_state.msgs.append({"role": "assistant", "content": resp.text})
