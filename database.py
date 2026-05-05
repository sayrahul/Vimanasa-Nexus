import gspread
import pandas as pd
import streamlit as st
from google.oauth2.service_account import Credentials

# Scopes required for Google Sheets and Drive
SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive"
]

def get_gspread_client():
    """Initializes and returns a gspread client using Streamlit secrets."""
    try:
        # Load credentials from st.secrets
        creds_dict = {
            "type": st.secrets["connections_gsheets"]["type"],
            "project_id": st.secrets["connections_gsheets"]["project_id"],
            "private_key_id": st.secrets["connections_gsheets"]["private_key_id"],
            "private_key": st.secrets["connections_gsheets"]["private_key"],
            "client_email": st.secrets["connections_gsheets"]["client_email"],
            "client_id": st.secrets["connections_gsheets"]["client_id"],
            "auth_uri": st.secrets["connections_gsheets"]["auth_uri"],
            "token_uri": st.secrets["connections_gsheets"]["token_uri"],
            "auth_provider_x509_cert_url": st.secrets["connections_gsheets"]["auth_provider_x509_cert_url"],
            "client_x509_cert_url": st.secrets["connections_gsheets"]["client_x509_cert_url"]
        }
        creds = Credentials.from_service_account_info(creds_dict, scopes=SCOPES)
        return gspread.authorize(creds)
    except Exception as e:
        st.error(f"Error connecting to Google Sheets: {e}")
        return None

def load_data(sheet_name):
    """Loads data from a specific tab in the Google Sheet."""
    client = get_gspread_client()
    if not client:
        return pd.DataFrame()
    
    try:
        # Open the spreadsheet by name
        sh = client.open("Vimanasa_HR_DB")
        worksheet = sh.worksheet(sheet_name)
        data = worksheet.get_all_records()
        return pd.DataFrame(data)
    except Exception as e:
        st.warning(f"Could not load sheet '{sheet_name}': {e}")
        return pd.DataFrame()

def add_data(sheet_name, row_data):
    """Appends a new row to a specific tab in the Google Sheet."""
    client = get_gspread_client()
    if not client:
        return False
    
    try:
        sh = client.open("Vimanasa_HR_DB")
        worksheet = sh.worksheet(sheet_name)
        worksheet.append_row(row_data)
        return True
    except Exception as e:
        st.error(f"Error adding data to '{sheet_name}': {e}")
        return False

def update_data(sheet_name, df):
    """Overwrites the entire sheet with a new dataframe."""
    client = get_gspread_client()
    if not client:
        return False
    
    try:
        sh = client.open("Vimanasa_HR_DB")
        worksheet = sh.worksheet(sheet_name)
        worksheet.clear()
        worksheet.update([df.columns.values.tolist()] + df.values.tolist())
        return True
    except Exception as e:
        st.error(f"Error updating sheet '{sheet_name}': {e}")
        return False
