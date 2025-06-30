from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from sqlalchemy import create_engine, text
from datetime import datetime
import uvicorn
import os
import pandas as pd
import json

def create_db_connection():
    """Create SQLAlchemy engine for PostgreSQL connection"""
    user = os.getenv('DB_USER')
    host = os.getenv('DB_HOST') # localhost
    port = os.getenv('DB_PORT') # default: 5432
    database = os.getenv('DB_NAME')
    
    connection_string = f"postgresql://{user}:@{host}:{port}/{database}"
    return create_engine(connection_string)


def load_csv(path): 
    """Load provided csv file to database"""
    engine = create_db_connection()

    df = pd.read_csv(path)
    df.to_sql('leads', engine, if_exists='replace', index=False, method='multi')

    print(f"Successfully loaded!")

#load_csv("data/leads.csv")
load_csv("data/new_leads.csv")

app = FastAPI()


origins = [
    "http://localhost:5173"
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EventData(BaseModel):
    user_id: int
    action: str
    metadata: Optional[Dict[str, Any]]


@app.get("/api/leads")
async def get_leads(industry: Optional[str] = Query(None, description="Filter by industry"),
                    min_size: Optional[int] = Query(None, description="Minimum company size"),
                    max_size: Optional[int] = Query(None, description="Maximum company size")
):
    engine = create_db_connection()   
    
    # query for ?
    query = "SELECT * FROM leads WHERE 1=1"
    params = {}
    
    if industry:
        query += " AND industry = :industry"
        params["industry"] = industry
    
    if min_size is not None:
        query += " AND size >= :min_size"
        params["min_size"] = min_size

    if max_size is not None:
        query += " AND size <= :max_size"
        params["max_size"] = max_size
    
    try:
        with engine.connect() as connection:
            result = connection.execute(text(query), params)
            leads = []
            
            for row in result:
                lead = {
                    "id": row.id,
                    "name": row.name,
                    "company": row.company,
                    "industry": row.industry,
                    "size": row.size,
                    "source": row.source,
                    "summary": row.summary,
                    "lead_quality": row.lead_quality,
                    "created_at": str(row.created_at)
                }
                leads.append(lead)
            
            return leads
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
@app.post("/api/events")
async def get_events(event: EventData):

    engine = create_db_connection()

    query = """
            INSERT INTO events (user_id, action, metadata, occurred_at)
            VALUES (:user_id, :action, :metadata, :occurred_at)
            RETURNING id, user_id, action, metadata, occurred_at
            """
    
    params = {
        "user_id": event.user_id,
        "action" : event.action,
        "metadata" : json.dumps(event.metadata) if event.metadata else None,
        "occurred_at" : datetime.now()
    }

    try:
        with engine.connect() as connection:
            result = connection.execute(text(query), params)
            connection.commit() # Save

            row = result.fetchone()

            final_event = {
                "id": row.id,
                "user_id": row.user_id,
                "action": row.action,
                "metadata": row.metadata,
                "occurred_at": str(row.occurred_at)
            }
        
            return {"status": "success"}
         
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)





