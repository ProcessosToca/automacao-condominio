import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import UserManagement from "./pages/UserManagement";
import PropertyManagement from "./pages/PropertyManagement";
import AdminCompanyRegistration from "./pages/AdminCompanyRegistration";
import SheetsData from "./pages/SheetsData";
import BulkEmails from "./pages/BulkEmails";
import SpreadsheetManagement from "./pages/SpreadsheetManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/properties" element={<PropertyManagement />} />
            <Route path="/admin-companies" element={<AdminCompanyRegistration />} />
            <Route path="/sheets-data" element={<SheetsData />} />
            <Route path="/bulk-emails" element={<BulkEmails />} />
            <Route path="/spreadsheet-management" element={<SpreadsheetManagement />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
