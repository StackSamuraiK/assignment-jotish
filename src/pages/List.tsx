import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVirtualization } from '../hooks/useVirtualization';
import { User, MapPin, DollarSign, ChevronRight, Search, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Employee {
  id: string;
  name: string;
  city: string;
  salary: string | number;
  [key: string]: any;
}

const List: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://backend.jotish.in/backend_dev/gettabledata.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username: 'test', password: '123456' }),
        });
        const result = await response.json();
        
        const rawData = result.TABLE_DATA?.data || [];
        
        const data = rawData.map((empArray: any[], index: number) => ({
          name: empArray[0],
          role: empArray[1],
          city: empArray[2],
          id: empArray[3] || `emp-${index}`,
          date: empArray[4],
          salary: empArray[5],
          salaryValue: parseFloat(empArray[5]?.replace(/[$,]/g, '')) || 0
        }));
        setEmployees(data);

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredEmployees = employees.filter(emp => 
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ITEM_HEIGHT = 80;
  const { 
    containerRef, 
    onScroll, 
    startIndex, 
    endIndex, 
    translateY, 
    totalContentHeight 
  } = useVirtualization({
    itemHeight: ITEM_HEIGHT,
    totalItems: filteredEmployees.length,
    overscan: 10
  });

  const visibleItems = filteredEmployees.slice(startIndex, endIndex);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2 rounded-lg">
            <User className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Employee Directory</h1>
            <p className="text-xs text-slate-500 font-medium">{filteredEmployees.length} total records</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate('/analytics', { state: { employees } })}
                className="text-sm font-semibold text-slate-900 hover:text-black px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
                Analytics
            </button>
            <button 
                onClick={logout}
                className="text-sm font-semibold text-slate-600 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
                Logout
            </button>
        </div>
      </header>

      <div className="px-6 py-4 bg-white border-b border-slate-200 flex gap-4 overflow-x-auto">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by name or city..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-slate-900/20 focus:border-slate-900 transition-all outline-none"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 hover:bg-slate-50 transition-all">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div 
            ref={containerRef}
            onScroll={onScroll}
            className="h-full overflow-y-auto"
          >
            <div style={{ height: totalContentHeight, position: 'relative' }}>
              <div 
                style={{ 
                  transform: `translateY(${translateY}px)`,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0
                }}
                className="divide-y divide-slate-100 px-6"
              >
                {visibleItems.map((emp) => (
                  <div 
                    key={emp.id}
                    onClick={() => navigate(`/details/${emp.id}`, { state: { employee: emp } })}
                    style={{ height: ITEM_HEIGHT }}
                    className="flex items-center justify-between group cursor-pointer hover:bg-white hover:shadow-md hover:rounded-xl transition-all duration-200 px-4 -mx-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-700 font-bold group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        {emp.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-slate-900 transition-colors">{emp.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {emp.city}</span>
                          <span className="flex items-center gap-1 font-medium text-slate-600"><DollarSign className="w-3 h-3" /> {emp.salary}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-100 p-2 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            
            {filteredEmployees.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <Search className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No records found</p>
                    <p className="text-sm">Try adjusting your search filters</p>
                </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default List;
