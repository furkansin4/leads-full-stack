import { useState, useEffect } from 'react';
import { get_leads, post_events, type Lead } from './services/api';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Chart } from 'primereact/chart';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Slider } from 'primereact/slider';
import { InputText } from 'primereact/inputtext';

import 'primereact/resources/themes/mdc-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';


const App = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<string>('table');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [sizeRange, setSizeRange] = useState<[number, number]>([0, 500]);

  const fetchLeads = async (industry?: string, minSize?: number, maxSize?: number)=> {
    try {
      setLoading(true);
      const data = await get_leads(industry, minSize, maxSize);
      setLeads(data);
      console.log(data);
    } catch (err) {
      setError('Failed to fetch leads');
      console.error('Error fetching leads:', err);
    } finally {
      setLoading(false);
    }
  };

  // demo purposes
  let user_id = 1;

  const changeUser = async () => {
    user_id += 1;
    console.log(user_id);
  };

  const refreshLeads = async () => {
    await post_events({
      user_id: user_id,
      action: 'refresh',
      metadata: {
        user_filters: {
          industry: selectedIndustry,
          size_range: sizeRange,
        },
      }
    });

    fetchLeads(selectedIndustry, sizeRange[0], sizeRange[1]);
  };

  const resetFilters = async () => {
    await post_events({
      user_id: user_id,
      action: 'reset',
      metadata: {
        previous_filters: {
          industry: selectedIndustry,
          size_range: sizeRange,
        },
      }

    });

    setSelectedIndustry('');
    setSizeRange([0, 500]);
    fetchLeads();
  };

  const trackView = async (newView: string) => {
    await post_events({
      user_id: user_id,
      action: 'toggle_view',
      metadata: { 
        view: newView,
        previous_view: view,
      }
    });
    setView(newView);
  };

  const trackIndustry = async (newIndustry: string) => {
    await post_events({
      user_id: user_id,
      action: 'filter',
      metadata: {
        filter_type: 'industry',
        filter_value: newIndustry,
        previous_filter: selectedIndustry,
      }
    });
    setSelectedIndustry(newIndustry);
  };

  const trackSizeRange = async (newRange: [number, number]) => {

    await post_events({
      user_id: user_id,
      action: 'filter',
      metadata: {
        filter_type: 'size_range',
        filter_value: newRange,
        previous_filter: sizeRange,
      }
    });

    setSizeRange(newRange);
  };

  
  useEffect(() => {
    fetchLeads();
  }, []);

  useEffect(() => {
    fetchLeads(selectedIndustry, sizeRange[0], sizeRange[1]);
  }, [selectedIndustry]);

  useEffect(() => {
    fetchLeads(selectedIndustry, sizeRange[0], sizeRange[1]);
  }, [sizeRange]);


  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  const industries = Object.keys(Object.groupBy(leads, (lead: Lead) => lead.industry));

  const groupedSources = Object.groupBy(leads, (lead: Lead) => lead.source);
  // console.log(groupedSources);

  const colors = [
    '#2e4053',
    '#cb4335',
    '#FF9F40',
    '#45b39d',
  ];


  const chartData = {
    labels: Object.keys(groupedSources),
    datasets: [
      {
        data: Object.values(groupedSources).map((source) => source?.length || 0),
        label: 'Source Distribution',
        backgroundColor: colors,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 20,
        ticks: {
          stepSize: 5
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    }
  };


  return (
    <div style={{ padding: '40px' }}>
    {/* Header with buttons aligned to the right */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      marginBottom: '40px' 
    }}>
      <h1 style={{ margin: 0 }}>Leads Analysis</h1>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Button 
          label="Refresh" 
          onClick={refreshLeads}
          icon="pi pi-refresh" 
        />
        <Button 
          label="Reset" 
          onClick={resetFilters}
          icon="pi pi-backward" 
        />
      </div>
    </div>
      <div style={{ marginBottom: '40px' }}>
        <Button label="Table" onClick={() => trackView('table')} style={{ marginRight: '10px' }} icon="pi pi-table" />
        <Button label="Chart" onClick={() => trackView('chart')} icon="pi pi-chart-bar" />
        <Button label="Change User" onClick={changeUser} icon="pi pi-user" style={{ position: 'absolute', top: '0', right: '0' , backgroundColor: '#FF7F50'}} />
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        alignItems: 'flex-start', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {/* Industry Filter */}
        <div style={{ flex: '1', minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Industry
          </label>
          <Dropdown 
            value={selectedIndustry}
            onChange={(e) => trackIndustry(e.value)}
            options={industries}
            placeholder="Select Industry"
            showClear={selectedIndustry !== ''}
            style={{ width: '100%' }}
          />
        </div>
        
        {/* Size Filter */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Size Range
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <InputText 
              value={sizeRange[0].toString()} 
              onChange={(e) => trackSizeRange([Number(e.target.value), sizeRange[1]])}
              style={{ width: '80px' }}
            />
            <span>-</span>
            <InputText 
              value={sizeRange[1].toString()} 
              onChange={(e) => trackSizeRange([sizeRange[0], Number(e.target.value)])}
              style={{ width: '80px' }}
            />
          </div>
          <Slider 
            value={sizeRange}
            onChange={(e) => trackSizeRange(e.value as [number, number])}
            range
            min={0}
            max={500}
            step={10}
            style={{ width: '100%', marginTop: '10px' }}
          />
        </div>
      </div>

      {view === 'chart' && (
        <div style={{ marginBottom: '40px', marginTop: '40px'}}>
          <Chart type="bar" data={chartData} options={chartOptions} width="35%" height="30%"/>
        </div>
      )}
      
      {view === 'table' && (
        <DataTable 
          value={leads} 
          stripedRows 
          showGridlines
          loading={loading}
          paginator 
          rows={10}
          tableStyle={{ minWidth: '50rem' }}
          emptyMessage="No leads found"
        >
          <Column field="id" header="ID" sortable style={{ width: '5%' }} />
          <Column field="name" header="Name" sortable style={{ width: '20%' }} />
          <Column field="company" header="Company" sortable style={{ width: '20%' }} />
          <Column field="industry" header="Industry" sortable style={{ width: '15%' }} />
          <Column field="size" header="Size" sortable style={{ width: '10%' }} />
          <Column field="source" header="Source" sortable style={{ width: '15%' }} />
          <Column 
            field="created_at" 
            header="Created At" 
            sortable 
            style={{ width: '15%' }}
            body={(rowData: Lead) => new Date(rowData.created_at).toLocaleDateString()}
          />
        </DataTable>
      )}
    </div>
  );
};

export default App;