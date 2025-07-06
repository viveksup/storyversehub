import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/admin/AdminLayout';
import AdminRoute from './components/admin/AdminRoute';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ExplorePage from './pages/ExplorePage';
import StoryPage from './pages/StoryPage';
import PricingPage from './pages/PricingPage';
import CreatePage from './pages/CreatePage';
import AuthorPage from './pages/AuthorPage';
import CategoryPage from './pages/CategoryPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import SupportPage from './pages/SupportPage';
import AdminHomePage from './pages/admin/AdminHomePage';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <AdminRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<AdminHomePage />} />
                <Route path="/dashboard" element={<AdminDashboard />} />
              </Routes>
            </AdminLayout>
          </AdminRoute>
        } />
        
        {/* Public Routes */}
        <Route path="/*" element={
          <div className="flex flex-col min-h-screen bg-space-dark text-white">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/story/:id" element={<StoryPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/create" element={<CreatePage />} />
                <Route path="/author/:id" element={<AuthorPage />} />
                <Route path="/category/:id" element={<CategoryPage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/support" element={<SupportPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;