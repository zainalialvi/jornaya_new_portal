import os
import asyncio
from pathlib import Path
from datetime import datetime
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from auth_utils import hash_password

load_dotenv(Path(__file__).resolve().parent.parent / '.env')

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = "form_dashboard"


async def seed_data():
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]

    print("Clearing existing data...")
    await db.users.delete_many({})
    await db.companies.delete_many({})
    await db.forms.delete_many({})
    await db.submissions.delete_many({})
    await db.audits.delete_many({})

    print("Creating admin user...")
    admin_result = await db.users.insert_one({
        "username": "admin_main",
        "password_hash": hash_password("admin123@main"),
        "role": "admin",
        "company_id": None,
        "created_at": datetime.utcnow()
    })
    admin_id = admin_result.inserted_id
    print(f"Created admin user with ID: {admin_id}")

    print("Creating company...")
    company_result = await db.companies.insert_one({
        "name": "Acme Corp",
        "contact_email": "contact@acme.com",
        "address": "123 Main St, City, State",
        "company_secret": "acme_secret_123",
        "is_active": True,
        "created_at": datetime.utcnow(),
        "created_by": admin_id
    })
    company_id = company_result.inserted_id
    print(f"Created company with ID: {company_id}")

    print("Creating supervisor user...")
    supervisor_result = await db.users.insert_one({
        "username": "supervisor1",
        "password_hash": hash_password("super123"),
        "role": "supervisor",
        "company_id": company_id,
        "created_at": datetime.utcnow()
    })
    print(f"Created supervisor with ID: {supervisor_result.inserted_id}")

    print("Creating regular user...")
    user_result = await db.users.insert_one({
        "username": "user1",
        "password_hash": hash_password("user123"),
        "role": "user",
        "company_id": company_id,
        "created_at": datetime.utcnow()
    })
    print(f"Created user with ID: {user_result.inserted_id}")

    print("Creating sample form...")
    form_schema = [
        {
            "id": "email",
            "name": "Email Address",
            "type": "email",
            "required": True,
            "validations": {},
            "options": None,
            "default": None
        },
        {
            "id": "phone",
            "name": "Phone Number",
            "type": "phone",
            "required": False,
            "validations": {},
            "options": None,
            "default": None
        },
        {
            "id": "age",
            "name": "Age",
            "type": "number",
            "required": False,
            "validations": {
                "min": 0,
                "max": 120
            },
            "options": None,
            "default": None
        }
    ]

    form_result = await db.forms.insert_one({
        "company_id": company_id,
        "schema": form_schema,
        "created_at": datetime.utcnow(),
        "created_by": admin_id
    })
    print(f"Created form with ID: {form_result.inserted_id}")

    print("\nSeed data created successfully!")
    print("\nLogin credentials:")
    print("  Admin:      username=admin_main, password=admin123@main")
    print("  Supervisor: username=supervisor1, password=super123")
    print("  User:       username=user1,       password=user123")
    print("\nCompany: Acme Corp")
    print("\nYou can now login at http://localhost:5173/login")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed_data())
