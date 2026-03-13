"use client";

import { useState } from "react";
import { Save, Bell, Phone, User, Smartphone } from "lucide-react";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    name: "Test Owner",
    email: "test@noidastay.com",
    phone: "9876543210",
    whatsapp: "9876543210"
  });

  const [notifications, setNotifications] = useState({
    emailLeads: true,
    whatsappLeads: true,
    appUpdates: false
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
    }, 1000); // Simulate API call
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Navigation/Sections context */}
        <div className="md:col-span-1 space-y-1">
          <button className="w-full text-left px-4 py-3 bg-gray-100 text-gray-900 font-medium rounded-xl transition-colors">
            Profile Settings
          </button>
          <button className="w-full text-left px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium rounded-xl transition-colors">
            Notification Preferences
          </button>
        </div>

        {/* Right Column - Forms */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Profile Section */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-600" />
              Owner Profile
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full rounded-xl border-gray-300 border py-2.5 px-3 text-gray-900 focus:ring-emerald-600 focus:border-emerald-600 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="w-full rounded-xl border-gray-300 border py-2.5 px-3 text-gray-900 focus:ring-emerald-600 focus:border-emerald-600 transition-colors bg-gray-50"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed directly.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-gray-400" /> Phone Number
                  </label>
                  <input 
                    type="tel" 
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="w-full rounded-xl border-gray-300 border py-2.5 px-3 text-gray-900 focus:ring-emerald-600 focus:border-emerald-600 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                    <Smartphone className="h-4 w-4 text-emerald-500" /> WhatsApp Number
                  </label>
                  <input 
                    type="tel" 
                    value={profile.whatsapp}
                    onChange={(e) => setProfile({...profile, whatsapp: e.target.value})}
                    className="w-full rounded-xl border-gray-300 border py-2.5 px-3 text-gray-900 focus:ring-emerald-600 focus:border-emerald-600 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Bell className="h-5 w-5 text-emerald-600" />
              Notifications
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent">
                <input 
                  type="checkbox" 
                  checked={notifications.whatsappLeads}
                  onChange={(e) => setNotifications({...notifications, whatsappLeads: e.target.checked})}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer" 
                />
                <div>
                  <p className="font-medium text-gray-900">WhatsApp Lead Alerts</p>
                  <p className="text-sm text-gray-500">Get an instant WhatsApp message when a student views your number.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent">
                <input 
                  type="checkbox" 
                  checked={notifications.emailLeads}
                  onChange={(e) => setNotifications({...notifications, emailLeads: e.target.checked})}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer" 
                />
                <div>
                  <p className="font-medium text-gray-900">Email Lead Reports</p>
                  <p className="text-sm text-gray-500">Receive a daily summary of all leads and profile views.</p>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent">
                <input 
                   type="checkbox" 
                   checked={notifications.appUpdates}
                   onChange={(e) => setNotifications({...notifications, appUpdates: e.target.checked})}
                   className="mt-1 h-5 w-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-600 cursor-pointer" 
                />
                <div>
                  <p className="font-medium text-gray-900">NoidaStay Updates</p>
                  <p className="text-sm text-gray-500">Occasional updates about new features and platform improvements.</p>
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 pb-12">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center px-6 py-3 rounded-xl font-medium transition-colors ${
                isSaving 
                  ? 'bg-emerald-400 text-white cursor-not-allowed' 
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow'
              }`}
            >
              <Save className="h-5 w-5 mr-2" />
              {isSaving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
