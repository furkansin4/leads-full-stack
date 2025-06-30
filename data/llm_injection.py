import pandas as pd
import ollama

df = pd.read_csv("data/leads.csv")

summaries = []

for i in range(len(df)):
    
    row = df.iloc[i]
    result = ollama.generate(model='llama3.2:3b', 
                            prompt='generate 1 sentence detailed text summary for company according to this data. Just give an answer: company: {}, industry: {}'.format(
                                row['company'], row['industry']))
    summaries.append(result['response'])
    print(f"Completed row {i+1}/{len(df)}: {row['company']}")

df['summary'] = summaries

lead_qualities = []

for i in range(len(df)):  
    row = df.iloc[i]
    result = ollama.generate(model='llama3.2:3b', 
                            prompt='classify lead quality (High/Medium/Low) based on industry and size. Respond with only one word: High, Medium, or Low. size: {}, industry: {}'.format(
                                row['size'], row['industry']))
    lead_qualities.append(result['response'])
    print(f"Processed row {i+1}/{len(df)}: {row['size']}, {row['industry']}")

df['lead_quality'] = lead_qualities

#print(df.head())

df.to_csv("data/new_leads.csv")