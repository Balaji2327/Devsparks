import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import ComplianceChecker from './components/ComplianceChecker';
import ProductListings from './components/ProductListings';
import Reports from './components/Reports';
import OCRScanner from './components/OCRScanner';
import ESP32Scanner from './components/ESP32Scanner';
import EnhancedDashboard from './components/EnhancedDashboard';
import BarcodeScanner from './components/BarcodeScanner';
import Header from './components/Header';
import LiveCrawlMonitor from './components/LiveCrawlMonitor';
import Sidebar from './components/Sidebar';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
          case 'enhanced-dashboard':
        return <EnhancedDashboard isLiveMode={false} />;
      case 'live-dashboard':
        return <EnhancedDashboard isLiveMode={true} />;
      case 'live-crawl':
        return <LiveCrawlMonitor />;

      case 'checker':
        return <ComplianceChecker />;
      case 'products':
        return <ProductListings />;
      case 'ocr':
        return <OCRScanner />;
      case 'esp32':
        return <ESP32Scanner />;
      case 'barcode':
        return <BarcodeScanner />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 p-6">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default App;