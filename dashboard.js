// Add console logging for debugging
console.log("Dashboard.js is loading...");
try {
  // Extract needed components from Recharts
  const {
    BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label
  } = Recharts || window.Recharts;  // Try both ways of accessing
  
  console.log("Recharts components extracted:", BarChart ? "success" : "failed");

  // Create the dashboard component
  const CookbookSalesDashboard = () => {
    console.log("Rendering dashboard component");
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    // Fetch data from data.json
    React.useEffect(() => {
      console.log("Fetching data...");
      fetch('./data.json')
        .then(response => {
          console.log("Data fetch response:", response.status);
          if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.status);
          }
          return response.json();
        })
        .then(data => {
          console.log("Data loaded successfully:", data);
          setData(data);
          setLoading(false);
          // Update the last updated text
          document.getElementById('lastUpdated').textContent = data.lastUpdated;
        })
        .catch(error => {
          console.error("Error loading data:", error);
          setError(error.message);
          setLoading(false);
        });
    }, []);

    // Format larger numbers with commas
    const formatNumber = (num) => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // Wait for data to load
    if (loading) return <div className="text-center p-10">Loading dashboard data...</div>;
    if (error) return <div className="text-center p-10 text-red-500">Error loading data: {error}</div>;
    if (!data) return <div className="text-center p-10">No data available.</div>;

    console.log("Preparing chart data");
    
    // Prepare the data for charts
    const platformData = [
      { name: 'Amazon US', value: data.platforms.amazon.us, color: '#FF9900' },
      { name: 'Amazon CA', value: data.platforms.amazon.ca, color: '#FF9900' },
      { name: 'Amazon UK', value: data.platforms.amazon.uk, color: '#FF9900' },
      { name: 'Shopify Physical', value: data.platforms.shopify.physical, color: '#96BF48' },
      { name: 'Shopify Digital', value: data.platforms.shopify.digital, color: '#5E8E3E' },
      { name: 'ClickFunnels Physical', value: data.platforms.clickfunnels.physical, color: '#3083DC' },
      { name: 'ClickFunnels Digital', value: data.platforms.clickfunnels.digital, color: '#2563EB' }
    ];

    // Platform total data for pie chart
    const platformTotalData = [
      { name: 'Amazon', value: data.platforms.amazon.total, color: '#FF9900' },
      { name: 'Shopify', value: data.platforms.shopify.total, color: '#96BF48' },
      { name: 'ClickFunnels', value: data.platforms.clickfunnels.total, color: '#3083DC' }
    ];

    // Format data for physical vs digital comparison
    const physicalVsDigitalData = [
      { 
        name: 'Physical', 
        shopify: data.platforms.shopify.physical, 
        clickfunnels: data.platforms.clickfunnels.physical 
      },
      { 
        name: 'Digital', 
        shopify: data.platforms.shopify.digital, 
        clickfunnels: data.platforms.clickfunnels.digital 
      }
    ];

    // Calculate percentages
    const amazonPercentage = ((data.platforms.amazon.total / data.totalSales) * 100).toFixed(1);
    const shopifyPercentage = ((data.platforms.shopify.total / data.totalSales) * 100).toFixed(1);
    const clickfunnelsPercentage = ((data.platforms.clickfunnels.total / data.totalSales) * 100).toFixed(1);

    // Custom tooltip for the charts
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-2 border border-gray-300 rounded shadow">
            <p className="font-semibold">{`${payload[0].name}: ${formatNumber(payload[0].value)} cookbooks`}</p>
          </div>
        );
      }
      return null;
    };

    console.log("Rendering charts");
    
    return (
      <div className="flex flex-col space-y-8 p-4 bg-gray-50 rounded-lg">
        <h1 className="text-2xl font-bold text-center">Cookbook Sales Dashboard</h1>
        <h2 className="text-xl font-semibold text-center text-green-700">
          Total Sales: {formatNumber(data.totalSales)} Cookbooks
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Platform Breakdown Bar Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-center">Sales by Channel</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={platformData}
                margin={{ top: 20, right: 30, left: 40, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis>
                  <Label
                    value="Cookbooks Sold"
                    position="insideLeft"
                    angle={-90}
                    style={{ textAnchor: 'middle' }}
                  />
                </YAxis>
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" name="Sales">
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Platform Total Pie Chart */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-center">Sales Distribution by Platform</h3>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={platformTotalData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {platformTotalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatNumber(value) + " cookbooks"} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Physical vs Digital Comparison */}
          <div className="bg-white p-4 rounded-lg shadow md:col-span-2">
            <h3 className="text-lg font-semibold mb-4 text-center">Physical vs Digital Sales</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={physicalVsDigitalData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis>
                  <Label
                    value="Cookbooks Sold"
                    position="insideLeft"
                    angle={-90}
                    style={{ textAnchor: 'middle' }}
                  />
                </YAxis>
                <Tooltip />
                <Legend />
                <Bar dataKey="shopify" name="Shopify" fill="#96BF48" />
                <Bar dataKey="clickfunnels" name="ClickFunnels" fill="#3083DC" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold">Amazon Total</h3>
            <p className="text-3xl font-bold text-amber-500">{formatNumber(data.platforms.amazon.total)}</p>
            <p className="text-sm text-gray-500">{amazonPercentage}% of total sales</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold">Shopify Total</h3>
            <p className="text-3xl font-bold text-green-600">{formatNumber(data.platforms.shopify.total)}</p>
            <p className="text-sm text-gray-500">{shopifyPercentage}% of total sales</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <h3 className="text-lg font-semibold">ClickFunnels Total</h3>
            <p className="text-3xl font-bold text-blue-600">{formatNumber(data.platforms.clickfunnels.total)}</p>
            <p className="text-sm text-gray-500">{clickfunnelsPercentage}% of total sales</p>
          </div>
        </div>
      </div>
    );
  };

  console.log("Attempting to render dashboard");
  
  // Render the dashboard
  const rootElement = document.getElementById('dashboard');
  if (rootElement) {
    ReactDOM.render(<CookbookSalesDashboard />, rootElement);
    console.log("Dashboard rendered to DOM");
  } else {
    console.error("Could not find dashboard element in DOM");
  }
  
} catch (err) {
  console.error("Critical error in dashboard.js:", err);
  document.body.innerHTML += `
    <div style="color: red; padding: 20px; margin: 20px; border: 1px solid red;">
      Dashboard Error: ${err.message}
    </div>
  `;
}