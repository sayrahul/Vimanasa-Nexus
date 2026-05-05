import streamlit as st
import pandas as pd
import plotly.express as px
import google.generativeai as genai
from datetime import datetime
import database as db

# --- Page Config ---
st.set_page_config(
    page_title="Vimanasa Nexus | HR & Outsourcing",
    page_icon="🏢",
    layout="wide",
    initial_sidebar_state="expanded",
)

# --- Custom Styling ---
st.markdown("""
    <style>
    .main {
        background-color: #f8f9fa;
    }
    .stMetric {
        background-color: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    div[data-testid="stSidebar"] {
        background-color: #1e1e2f;
        color: white;
    }
    </style>
    """, unsafe_allow_html=True)

# --- Sidebar Navigation ---
st.sidebar.title("🏢 Vimanasa Nexus")
st.sidebar.subheader("Business Management")
menu = ["Dashboard", "Employee Management", "Client & Outsourcing", "Attendance & Payroll", "AI HR Assistant"]
choice = st.sidebar.radio("Navigate", menu)

# --- Initialize AI ---
try:
    genai.configure(api_key=st.secrets["gemini"]["api_key"])
    model = genai.GenerativeModel('gemini-1.5-flash')
except Exception as e:
    st.sidebar.error("AI Assistant unavailable: Check API Key")

# --- Helper Functions ---
def get_all_context():
    """Fetches all data to provide context to the AI."""
    emp = db.load_data("Employees")
    clients = db.load_data("Clients")
    deployments = db.load_data("Deployments")
    attendance = db.load_data("Attendance")
    
    context = f"""
    Current Business State:
    Employees: {emp.to_string(index=False) if not emp.empty else "None"}
    Clients: {clients.to_string(index=False) if not clients.empty else "None"}
    Deployments: {deployments.to_string(index=False) if not deployments.empty else "None"}
    Attendance: {attendance.to_string(index=False) if not attendance.empty else "None"}
    """
    return context

# --- Module: Dashboard ---
if choice == "Dashboard":
    st.title("🚀 Business Dashboard")
    
    # Load Data
    df_emp = db.load_data("Employees")
    df_deploy = db.load_data("Deployments")
    df_payroll = db.load_data("Attendance")
    
    # Metrics
    col1, col2, col3 = st.columns(3)
    total_employees = len(df_emp) if not df_emp.empty else 0
    active_deployments = len(df_deploy) if not df_deploy.empty else 0
    total_payroll = df_payroll['Total_Wage'].sum() if not df_payroll.empty and 'Total_Wage' in df_payroll.columns else 0
    
    with col1:
        st.metric("Total Employees", total_employees)
    with col2:
        st.metric("Active Deployments", active_deployments)
    with col3:
        st.metric("Total Payroll (Current)", f"₹{total_payroll:,.2f}")

    st.divider()
    
    # Charts
    if not df_payroll.empty and 'Month' in df_payroll.columns:
        st.subheader("Payroll Trends")
        fig = px.bar(df_payroll, x='Month', y='Total_Wage', color='Month', 
                     title="Monthly Payroll Disbursement", template="plotly_white")
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("No payroll data available for visualization yet.")

# --- Module: Employee Management ---
elif choice == "Employee Management":
    st.title("👥 Employee Management")
    
    tab1, tab2 = st.tabs(["Onboard Employee", "Employee Directory"])
    
    with tab1:
        with st.form("onboarding_form", clear_on_submit=True):
            st.subheader("New Employee Details")
            col1, col2 = st.columns(2)
            name = col1.text_input("Full Name")
            phone = col2.text_input("Phone Number")
            aadhaar = col1.text_input("Aadhaar Number")
            pan = col2.text_input("PAN Number")
            bank = col1.text_input("Bank Account Number")
            ifsc = col2.text_input("IFSC Code")
            role = col1.selectbox("Role", ["Manager", "Staff", "Security", "Technical", "Housekeeping"])
            salary = col2.number_input("Base Salary", min_value=0, step=500)
            epf = col1.text_input("EPF Number")
            esic = col2.text_input("ESIC Number")
            
            submitted = st.form_submit_button("Submit Onboarding")
            
            if submitted:
                if name and phone:
                    emp_id = f"EMP{datetime.now().strftime('%d%m%y%H%M%S')}"
                    new_row = [emp_id, name, phone, aadhaar, pan, bank, ifsc, role, salary, epf, esic, "Active"]
                    if db.add_data("Employees", new_row):
                        st.toast("Employee Onboarded Successfully!", icon="✅")
                    else:
                        st.error("Failed to add employee.")
                else:
                    st.error("Name and Phone are mandatory.")

    with tab2:
        df_emp = db.load_data("Employees")
        if not df_emp.empty:
            st.subheader("Current Staff Registry")
            search = st.text_input("Search Employees...")
            if search:
                df_emp = df_emp[df_emp.apply(lambda row: search.lower() in row.astype(str).str.lower().values, axis=1)]
            st.dataframe(df_emp, use_container_width=True, hide_index=True)
        else:
            st.info("No employees found.")

# --- Module: Client & Outsourcing ---
elif choice == "Client & Outsourcing":
    st.title("🏢 Client & Outsourcing Management")
    
    tab1, tab2 = st.tabs(["Manage Clients", "Deployments"])
    
    with tab1:
        st.subheader("Add New Client")
        with st.form("client_form", clear_on_submit=True):
            c_name = st.text_input("Client/Organization Name")
            industry = st.text_input("Industry")
            contact = st.text_input("Contact Person")
            email = st.text_input("Email")
            c_submit = st.form_submit_button("Register Client")
            
            if c_submit:
                if c_name:
                    c_id = f"CL{datetime.now().strftime('%d%H%M')}"
                    if db.add_data("Clients", [c_id, c_name, industry, contact, email]):
                        st.toast("Client Registered!", icon="🏢")
                    else:
                        st.error("Error saving client.")
        
        df_clients = db.load_data("Clients")
        if not df_clients.empty:
            st.subheader("Active Clients")
            st.dataframe(df_clients, use_container_width=True)

    with tab2:
        st.subheader("New Deployment")
        df_emp = db.load_data("Employees")
        df_clients = db.load_data("Clients")
        
        if not df_emp.empty and not df_clients.empty:
            with st.form("deployment_form"):
                emp_to_deploy = st.selectbox("Select Employee", df_emp['Name'].tolist())
                client_target = st.selectbox("Select Client", df_clients['Client_Name'].tolist())
                role_at_client = st.text_input("Role at Client Site")
                start_date = st.date_input("Start Date")
                
                d_submit = st.form_submit_button("Confirm Deployment")
                if d_submit:
                    d_id = f"DEP{datetime.now().strftime('%d%H%M')}"
                    if db.add_data("Deployments", [d_id, emp_to_deploy, client_target, str(start_date), role_at_client]):
                        st.toast(f"Deployed {emp_to_deploy} to {client_target}", icon="📍")
        else:
            st.warning("Ensure both Employees and Clients are registered before deployment.")
            
        df_deploy = db.load_data("Deployments")
        if not df_deploy.empty:
            st.subheader("Active Deployments Overview")
            st.dataframe(df_deploy, use_container_width=True)

# --- Module: Attendance & Payroll ---
elif choice == "Attendance & Payroll":
    st.title("💰 Attendance & Payroll Overview")
    
    df_emp = db.load_data("Employees")
    
    if not df_emp.empty:
        st.subheader("Mark Monthly Attendance")
        with st.form("attendance_form"):
            selected_emp = st.selectbox("Select Employee", df_emp['Name'].tolist())
            month = st.selectbox("Month", ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"])
            year = st.number_input("Year", min_value=2024, max_value=2030, value=2026)
            days_worked = st.number_input("Days Worked", min_value=0, max_value=31, step=1)
            
            calc_submit = st.form_submit_button("Calculate & Save Payroll")
            
            if calc_submit:
                base_sal = df_emp[df_emp['Name'] == selected_emp]['Base_Salary'].values[0]
                total_wage = (base_sal / 30) * days_worked
                rec_id = f"PAY{datetime.now().strftime('%d%H%M')}"
                if db.add_data("Attendance", [rec_id, selected_emp, month, year, days_worked, round(total_wage, 2)]):
                    st.toast(f"Payroll for {selected_emp} saved: ₹{total_wage:,.2f}", icon="💵")

    df_payroll = db.load_data("Attendance")
    if not df_payroll.empty:
        st.subheader("Payroll History")
        st.dataframe(df_payroll, use_container_width=True)
    else:
        st.info("No attendance records found.")

# --- Module: AI HR Assistant ---
elif choice == "AI HR Assistant":
    st.title("🤖 AI HR Assistant")
    st.markdown("Ask me anything about your staff, deployments, or payroll.")
    
    if "messages" not in st.session_state:
        st.session_state.messages = []

    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    if prompt := st.chat_input("Ex: Who is deployed at Municipal Corp?"):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            with st.spinner("Analyzing data..."):
                context = get_all_context()
                full_prompt = f"System Context:\n{context}\n\nUser Question: {prompt}\n\nAnswer the user question accurately based on the data provided. Be professional and concise."
                
                try:
                    response = model.generate_content(full_prompt)
                    st.markdown(response.text)
                    st.session_state.messages.append({"role": "assistant", "content": response.text})
                except Exception as e:
                    st.error(f"AI Error: {e}")
