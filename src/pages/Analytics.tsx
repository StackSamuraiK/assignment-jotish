import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Home, BarChart3, Map as MapIcon, Image as ImageIcon, ArrowLeft, Download } from 'lucide-react';

// Fix Leaflet icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Employee {
  id: string;
  name: string;
  city: string;
  salary: string | number;
  salaryValue: number;
}

const CITY_COORDS: Record<string, [number, number]> = {
  'New York': [40.7128, -74.0060],
  'London': [51.5074, -0.1278],
  'San Francisco': [37.7749, -122.4194],
  'Tokyo': [35.6762, 139.6503],
  'Paris': [48.8566, 2.3522],
  'Berlin': [52.5200, 13.4050],
  'Mumbai': [19.0760, 72.8777],
  'Sydney': [-33.8688, 151.2093],
  'Bangalore': [12.9716, 77.5946],
  'Delhi': [28.6139, 77.2090],
  'Pune': [18.5204, 73.8567],
  'Hyderabad': [17.3850, 78.4867],
  // Add fallback for common Indian cities if data comes from there
  'Bangaluru': [12.9716, 77.5946],
  'Bengaluru': [12.9716, 77.5946],
};

const Analytics: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mergedImage, employee, employees } = location.state || {};
  
  const [data, setData] = useState<Employee[]>(employees || []);

  useEffect(() => {
    if (!employees) {
      // Fallback: fetch again if page refreshed
      const fetchData = async () => {
        try {
          const response = await fetch('https://backend.jotish.in/backend_dev/gettabledata.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'test', password: '123456' }),
          });
          const result = await response.json();
          const items = (result.data || result).map((emp: any, index: number) => ({
            ...emp,
            id: emp.id || `emp-${index}`,
            salaryValue: parseFloat(emp.salary) || 0
          }));
          setData(items);
        } catch (err) {
          console.error(err);
        }
      };
      fetchData();
    }
  }, [employees]);

  const cityData = useMemo(() => {
    const groups: Record<string, { total: number, count: number, coords: [number, number] }> = {};
    data.forEach(emp => {
      const city = emp.city || 'Unknown';
      if (!groups[city]) {
        groups[city] = { 
          total: 0, 
          count: 0, 
          coords: CITY_COORDS[city] || [20, 77] // Default to center of India if unknown
        };
      }
      groups[city].total += emp.salaryValue;
      groups[city].count += 1;
    });

    return Object.entries(groups).map(([city, stats]) => ({
      city,
      avgSalary: stats.total / stats.count,
      count: stats.count,
      coords: stats.coords
    })).sort((a, b) => b.avgSalary - a.avgSalary);
  }, [data]);

  const maxAvgSalary = Math.max(...cityData.map(c => c.avgSalary), 1);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-12">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-[1000] shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/list')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Advanced Analytics</h1>
        </div>
        <button 
          onClick={() => navigate('/list')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <Home className="w-4 h-4" /> Back to Home
        </button>
      </header>

      <main className="p-6 max-w-7xl mx-auto w-full space-y-8">
        {/* Merged Image Section */}
        {mergedImage && (
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                    <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Audit Verification Result</h2>
                    <p className="text-sm text-slate-500">Merged Photo + Signature for {employee?.name}</p>
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="relative group w-full md:w-1/2">
                <img 
                  src={mergedImage} 
                  alt="Audit result" 
                  className="rounded-2xl border-4 border-slate-50 shadow-2xl w-full"
                />
                <a 
                    href={mergedImage} 
                    download={`audit_${employee?.id}.png`}
                    className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/40 p-3 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all"
                >
                    <Download className="w-5 h-5" />
                </a>
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-600" /> Identity Verified Successfully
                    </h3>
                    <ul className="space-y-3 text-slate-600 text-sm">
                        <li className="flex justify-between"><span>Employee:</span> <span className="font-bold text-slate-900">{employee?.name}</span></li>
                        <li className="flex justify-between"><span>Location:</span> <span className="font-bold text-slate-900">{employee?.city}</span></li>
                        <li className="flex justify-between"><span>Salary:</span> <span className="font-bold text-slate-900">{employee?.salary}</span></li>
                        <li className="flex justify-between"><span>Verified At:</span> <span className="font-bold text-slate-900">{new Date().toLocaleString()}</span></li>
                    </ul>
                </div>
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
                    <p className="text-xs text-indigo-700 font-medium">
                        This document is programmatically merged and signed on the local client using HTML5 Canvas. No intermediary servers were used for image processing.
                    </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Charts & Maps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Custom SVG Chart */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <BarChart3 className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Salary Distribution by City</h2>
            </div>
            
            <div className="h-[400px] w-full mt-4">
              <svg width="100%" height="100%" viewBox="0 0 500 300" preserveAspectRatio="none">
                {/* Grid Lines */}
                {[0, 1, 2, 3, 4].map(i => (
                  <line 
                    key={i} 
                    x1="40" 
                    y1={250 - (i * 50)} 
                    x2="480" 
                    y2={250 - (i * 50)} 
                    stroke="#f1f5f9" 
                    strokeWidth="1" 
                  />
                ))}
                
                {/* Bars */}
                {cityData.slice(0, 6).map((c, i) => {
                  const barWidth = 40;
                  const spacing = (440 - (6 * barWidth)) / 7;
                  const x = 40 + spacing + (i * (barWidth + spacing));
                  const height = (c.avgSalary / maxAvgSalary) * 200;
                  const y = 250 - height;
                  
                  return (
                    <g key={c.city} className="group cursor-help">
                      <rect 
                        x={x} 
                        y={y} 
                        width={barWidth} 
                        height={height} 
                        fill="#4f46e5" 
                        rx="4"
                        className="transition-all duration-300 hover:fill-indigo-400"
                      >
                        <title>{c.city}: ${c.avgSalary.toFixed(0)}</title>
                      </rect>
                      <text 
                        x={x + barWidth/2} 
                        y="270" 
                        textAnchor="middle" 
                        className="text-[10px] fill-slate-500 font-medium"
                      >
                        {c.city.length > 8 ? c.city.substring(0, 5) + '...' : c.city}
                      </text>
                      <text 
                        x={x + barWidth/2} 
                        y={y - 10} 
                        textAnchor="middle" 
                        className="text-[8px] font-bold fill-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ${(c.avgSalary/1000).toFixed(1)}k
                      </text>
                    </g>
                  );
                })}
                
                {/* Y-Axis Label */}
                <text x="5" y="150" transform="rotate(-90, 10, 150)" className="text-[10px] fill-slate-400 uppercase tracking-widest font-bold">
                    Salary (Avg)
                </text>
              </svg>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
                {cityData.slice(0, 4).map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                        <span className="text-xs text-slate-500 font-medium">{c.city}</span>
                    </div>
                ))}
            </div>
          </section>

          {/* Map Section */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                    <MapIcon className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Geospatial Insights</h2>
            </div>
            
            <div className="flex-1 rounded-2xl overflow-hidden border border-slate-100 h-[400px]">
              <MapContainer 
                center={[20, 0]} 
                zoom={2} 
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {cityData.map((c) => (
                  <Marker key={c.city} position={c.coords}>
                    <Popup>
                      <div className="p-2">
                        <h4 className="font-bold text-slate-900">{c.city}</h4>
                        <p className="text-xs text-slate-500">Employees: {c.count}</p>
                        <p className="text-xs text-slate-500 font-bold">Avg: ${c.avgSalary.toFixed(0)}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Analytics;

const Check = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="20 6 9 17 4 12"></polyline></svg>
);
