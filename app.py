import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from google import genai
from datetime import datetime
import database as db
from PIL import Image
import json
from streamlit_option_menu import option_menu
from streamlit_extras.metric_cards import style_metric_cards
from streamlit_extras.add_vertical_space import add_vertical_space

# --- Page Config ---
st.set_page_config(
    page_title="Vimanasa Nexus | Command Center",
    page_icon="🏢",
    layout="wide",
)

# --- Custom CSS ---
st.markdown("""
    <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap');
    * { font-family: 'Outfit', sans-serif; }
    .main { background-color: #f4f7f6; }
    
    /* Premium KPI Card */
    .kpi-card {
        background: white;
        padding: 1.5rem;
        border-radius: 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        border-bottom: 4px solid #3b82f6;
    }
    
    .main-header {
        background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
        padding: 2.5rem;
        border-radius: 20px;
        color: white;
        margin-bottom: 2rem;
        box-shadow: 0 10px 25px rgba(59, 130, 246, 0.2);
    }
    
    /* Activity Feed */
    .activity-item {
        padding: 10px;
        border-left: 3px solid #3b82f6;
        background: #f8fafc;
        margin-bottom: 8px;
        border-radius: 0 8px 8px 0;
        font-size: 0.9rem;
    }
    </style>
    """, unsafe_allow_html=True)

# --- Authentication ---
def login():
    st.markdown("<div style='text-align: center; margin-top: 50px;'>", unsafe_allow_html=True)
    st.image("assets/vimanasa_logo.png", width=400)
    st.markdown("<h1 style='color: #1e3a8a;'>Enterprise Portal</h1>", unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 1, 1])
    with col2:
        with st.form("login"):
            u = st.text_input("Username")
            p = st.text_input("Password", type="password")
            if st.form_submit_button("Enter Command Center", use_container_width=True):
                if u == st.secrets["auth"]["admin_user"] and p == st.secrets["auth"]["admin_password"]:
                    st.session_state["authenticated"] = True
                    st.rerun()
                else: st.error("Access Denied")
    st.markdown("</div>", unsafe_allow_html=True)

if "authenticated" not in st.session_state:
    login(); st.stop()

# --- Initialize AI ---
client = genai.Client(api_key=st.secrets["gemini"]["api_key"])

# --- DATA STATE ---
def get_all_data():
    headers = {
        "employees": ["ID", "Name", "Phone", "Aadhaar", "PAN", "Bank_Account", "IFSC", "Role", "Base_Salary", "EPF_No", "ESIC_No", "Status"],
        "clients": ["Client_ID", "Client_Name", "Industry", "Contact_Person", "Email"],
        "deployments": ["Deployment_ID", "Employee_Name", "Client_Name", "Start_Date", "Role_at_Client"],
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
    st.image("assets/vimanasa_logo.png", use_container_width=True)
    add_vertical_space(1)
    selected = option_menu(
        menu_title=None,
        options=["Dashboard", "Employees", "Clients", "Payroll", "AI Assistant"],
        icons=["speedometer2", "people", "building", "cash-stack", "robot"],
        default_index=0
    )
    add_vertical_space(2)
    st.info(f"📅 {datetime.now().strftime('%A, %d %B')}")
    if st.button("🔄 Sync Operations", use_container_width=True):
        for key in [k for k in st.session_state.keys() if k.startswith("df_")]:
            del st.session_state[key]
        st.rerun()
    if st.button("Logout"): del st.session_state["authenticated"]; st.rerun()

# --- Dashboard Overhaul ---
if selected == "Dashboard":
    # Header Section
    st.markdown(f"""
        <div class='main-header'>
            <h1>Welcome back, Admin 👋</h1>
            <p>Vimanasa Nexus is currently monitoring {len(data['employees'])} employees across {len(data['clients'])} client sites.</p>
        </div>
    """, unsafe_allow_html=True)
    
    # KPI Grid
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.metric("Total Workforce", len(data['employees']))
    with c2:
        active_p = (len(data['deployments']) / len(data['employees']) * 100) if len(data['employees']) > 0 else 0
        st.metric("Deployment Rate", f"{active_p:.1f}%")
    with c3:
        total_net = data['attendance']['Net_Pay'].sum() if not data['attendance'].empty else 0
        st.metric("Monthly Payroll", f"₹{total_net/1000:,.1f}K")
    with c4:
        st.metric("Active Clients", len(data['clients']))
    
    style_metric_cards(border_left_color="#3b82f6")
    
    st.divider()
    
    # Insights Section
    col_l, col_r = st.columns([2, 1])
    
    with col_l:
        st.subheader("📈 Workforce Growth & Distribution")
        tabs = st.tabs(["Role Composition", "Deployment Snapshot"])
        with tabs[0]:
            if not data['employees'].empty:
                role_counts = data['employees']['Role'].value_counts().reset_index()
                fig = px.bar(role_counts, x='Role', y='count', color='Role', 
                           title="Employees by Functional Role", template="plotly_white")
                st.plotly_chart(fig, use_container_width=True)
        with tabs[1]:
            if not data['deployments'].empty:
                fig = px.sunburst(data['deployments'], path=['Client_Name', 'Employee_Name'], 
                                 title="Hierarchy of Site Deployments")
                st.plotly_chart(fig, use_container_width=True)

    with col_r:
        st.subheader("🔔 Recent Activities")
        # Combine last 5 entries from all sheets for a feed
        activities = []
        if not data['employees'].empty:
            for n in data['employees'].tail(3)['Name']: activities.append(f"👤 New Employee: {n}")
        if not data['deployments'].empty:
            for _, r in data['deployments'].tail(3).iterrows(): activities.append(f"📍 Deployed {r['Employee_Name']} to {r['Client_Name']}")
        
        if activities:
            for act in reversed(activities[-10:]):
                st.markdown(f"<div class='activity-item'>{act}</div>", unsafe_allow_html=True)
        else:
            st.info("No recent activity found.")

# --- Employees ---
elif selected == "Employees":
    st.title("👤 Workforce Command")
    tab1, tab2, tab3 = st.tabs(["✨ AI Onboarding", "🗂️ Master Registry", "🏢 Site-wise Division"])
    
    with tab1:
        st.subheader("Intelligent Employee Onboarding")
        uploaded_file = st.file_uploader("Upload ID Document", type=['png', 'jpg', 'jpeg'])
        ocr_data = {}
        if uploaded_file:
            with st.spinner("AI is analyzing identity..."):
                img = Image.open(uploaded_file)
                resp = client.models.generate_content(model="gemini-1.5-flash", contents=["Extract Name, ID Number, DOB as JSON", img])
                try: ocr_data = json.loads(resp.text.strip('`json\n '))
                except: st.warning("OCR Analysis Failed")

        with st.form("onboard"):
            c1, c2 = st.columns(2)
            n = c1.text_input("Employee Full Name", value=ocr_data.get('name', ''))
            p = c2.text_input("Mobile Number")
            role = c1.selectbox("Role", ["Staff", "Management", "Technical", "Security"])
            sal = c2.number_input("Monthly Base Salary", min_value=0)
            if st.form_submit_button("Finalize Onboarding", use_container_width=True):
                emp_id = f"EMP{datetime.now().strftime('%H%M')}"
                new_row = [emp_id, n, p, ocr_data.get('id',''), "", "", "", role, sal, "", "", "Active"]
                if db.add_data("Employees", new_row):
                    st.session_state.df_employees = pd.concat([st.session_state.df_employees, pd.DataFrame([new_row], columns=st.session_state.df_employees.columns)], ignore_index=True)
                    st.success("Successfully Onboarded!"); st.rerun()

    with tab2:
        edited = st.data_editor(st.session_state.df_employees, width='stretch', hide_index=True)
        if st.button("Save Changes to Master Registry"):
            if db.update_data("Employees", edited):
                st.session_state.df_employees = edited; st.success("Synced!")

    with tab3:
        df_merged = pd.merge(st.session_state.df_employees, st.session_state.df_deployments, left_on='Name', right_on='Employee_Name', how='left')
        df_merged['Client_Name'] = df_merged['Client_Name'].fillna('Unassigned')
        for client in df_merged['Client_Name'].unique():
            with st.expander(f"📍 {client}"):
                st.dataframe(df_merged[df_merged['Client_Name']==client][['ID', 'Name', 'Phone', 'Role']], width='stretch', hide_index=True)

# --- Clients ---
elif selected == "Clients":
    st.title("🏢 Client Command")
    tab1, tab2, tab3 = st.tabs(["🆕 Register Client", "📁 Directory", "📍 New Deployment"])
    with tab1:
        with st.form("add_client"):
            cn = st.text_input("Company Name")
            ind = st.text_input("Industry Type")
            con = st.text_input("Point of Contact")
            if st.form_submit_button("Register Client", use_container_width=True):
                cid = f"CL{datetime.now().strftime('%H%M')}"
                new_c = [cid, cn, ind, con, ""]
                if db.add_data("Clients", new_c):
                    st.session_state.df_clients = pd.concat([st.session_state.df_clients, pd.DataFrame([new_c], columns=st.session_state.df_clients.columns)], ignore_index=True)
                    st.success("Client Registered!"); st.rerun()
    with tab2:
        edited = st.data_editor(st.session_state.df_clients, width='stretch', hide_index=True)
        if st.button("Save Updates"):
            if db.update_data("Clients", edited): st.session_state.df_clients = edited; st.success("Updated")
    with tab3:
        with st.form("deploy"):
            emp_name = st.selectbox("Employee", st.session_state.df_employees['Name'].tolist())
            cli_name = st.selectbox("Client", st.session_state.df_clients['Client_Name'].tolist())
            if st.form_submit_button("Confirm Deployment", use_container_width=True):
                did = f"D{datetime.now().strftime('%M%S')}"
                new_d = [did, emp_name, cli_name, str(datetime.now().date()), "Assigned"]
                if db.add_data("Deployments", new_d):
                    st.session_state.df_deployments = pd.concat([st.session_state.df_deployments, pd.DataFrame([new_d], columns=st.session_state.df_deployments.columns)], ignore_index=True)
                    st.success("Deployed!"); st.rerun()

# --- Payroll ---
elif selected == "Payroll":
    st.title("💰 Payroll & Compliance Engine")
    with st.form("pay"):
        e = st.selectbox("Select Employee", data['employees']['Name'].tolist())
        d = st.number_input("Active Days", 0, 31, 30)
        if st.form_submit_button("Generate Pay Slip"):
            base = data['employees'][data['employees']['Name']==e]['Base_Salary'].values[0]
            earned = (base/30)*d
            deduct = (earned*0.12) + (200 if earned>15000 else 0)
            net = earned - deduct
            row = [f"P{datetime.now().strftime('%M%S')}", e, datetime.now().strftime('%B'), 2026, d, base, earned*0.12, 0, 200, 0, net]
            if db.add_data("Attendance", row):
                st.session_state.df_attendance = pd.concat([st.session_state.df_attendance, pd.DataFrame([row], columns=st.session_state.df_attendance.columns)], ignore_index=True)
                st.success(f"Net Payable: ₹{net:,.2f}"); st.rerun()
    st.subheader("📜 Payroll History")
    st.dataframe(st.session_state.df_attendance, width='stretch')

# --- AI Assistant ---
elif selected == "AI Assistant":
    st.title("🤖 Nexus Intelligent Oracle")
    if "messages" not in st.session_state: st.session_state.messages = []
    for m in st.session_state.messages:
        with st.chat_message(m["role"]): st.markdown(m["content"])
    if p := st.chat_input("Query anything..."):
        st.session_state.messages.append({"role": "user", "content": p})
        with st.chat_message("user"): st.markdown(p)
        with st.chat_message("assistant"):
            ctx = f"Data:\nEmp:{st.session_state.df_employees.to_string()}\nPay:{st.session_state.df_attendance.to_string()}"
            resp = client.models.generate_content(model="gemini-1.5-flash", contents=[f"Data Context:\n{ctx}\n\nQuestion: {prompt}"])
            st.markdown(resp.text); st.session_state.messages.append({"role": "assistant", "content": resp.text})
