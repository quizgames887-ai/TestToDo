import { useState, useEffect } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useAuth } from '../hooks/useAuth'
import {
  Bell,
  Mail,
  Smartphone,
  Clock,
  Moon,
  Sun,
  Monitor,
  Save,
  Loader2,
  User,
  Shield,
} from 'lucide-react'

export function Settings() {
  const { user, signOut } = useAuth()
  const userSettings = useQuery(api.userSettings.get)
  const updateSettings = useMutation(api.userSettings.update)
  const updateProfile = useMutation(api.users.updateProfile)

  const [name, setName] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [reminderHours, setReminderHours] = useState(24)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
    }
  }, [user])

  useEffect(() => {
    if (userSettings) {
      setEmailNotifications(userSettings.notificationPreferences.email)
      setPushNotifications(userSettings.notificationPreferences.push)
      setReminderHours(userSettings.notificationPreferences.reminderBeforeDue)
      setTheme(userSettings.theme || 'light')
      setHasChanges(false)
    }
  }, [userSettings])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await Promise.all([
        updateSettings({
          notificationPreferences: {
            email: emailNotifications,
            push: pushNotifications,
            reminderBeforeDue: reminderHours,
          },
          theme,
        }),
        updateProfile({ name: name || undefined }),
      ])
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = <T,>(setter: (val: T) => void) => (value: T) => {
    setter(value)
    setHasChanges(true)
  }

  if (!userSettings) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="spinner w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-medium text-surface-900 mb-2">Settings</h1>
          <p className="text-sm sm:text-base text-surface-500 font-sans">Manage your preferences</p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
                <span className="sm:hidden">Saving</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save Changes</span>
                <span className="sm:hidden">Save</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <section className="card">
          <h2 className="text-lg font-serif font-medium text-surface-900 mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            Profile
          </h2>

          <div className="space-y-4">
            <div>
              <label className="input-label">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleChange(setName)(e.target.value)}
                className="input"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="input-label">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input bg-surface-50 text-surface-500"
              />
              <p className="text-xs text-surface-500 mt-1 font-sans">
                Email cannot be changed
              </p>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="card">
          <h2 className="text-lg font-serif font-medium text-surface-900 mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-600" />
            Notifications
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-surface-100">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-surface-500" />
                <div>
                  <p className="font-medium text-surface-900 text-sm">Email notifications</p>
                  <p className="text-xs text-surface-500 font-sans">
                    Receive reminders and updates via email
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleChange(setEmailNotifications)(!emailNotifications)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  emailNotifications ? 'bg-primary-600' : 'bg-surface-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-surface-100">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-surface-500" />
                <div>
                  <p className="font-medium text-surface-900 text-sm">Push notifications</p>
                  <p className="text-xs text-surface-500 font-sans">
                    Receive browser push notifications
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleChange(setPushNotifications)(!pushNotifications)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  pushNotifications ? 'bg-primary-600' : 'bg-surface-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    pushNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="py-3">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-5 h-5 text-surface-500" />
                <div>
                  <p className="font-medium text-surface-900 text-sm">Default reminder time</p>
                  <p className="text-xs text-surface-500 font-sans">
                    How long before due date to send reminders
                  </p>
                </div>
              </div>
              <select
                value={reminderHours}
                onChange={(e) => handleChange(setReminderHours)(Number(e.target.value))}
                className="input py-2"
              >
                <option value={1}>1 hour before</option>
                <option value={2}>2 hours before</option>
                <option value={4}>4 hours before</option>
                <option value={8}>8 hours before</option>
                <option value={24}>1 day before</option>
                <option value={48}>2 days before</option>
                <option value={72}>3 days before</option>
                <option value={168}>1 week before</option>
              </select>
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section className="card">
          <h2 className="text-lg font-serif font-medium text-surface-900 mb-6 flex items-center gap-2">
            <Sun className="w-5 h-5 text-primary-600" />
            Appearance
          </h2>

          <div>
            <label className="input-label mb-3">Theme</label>
            <div className="flex flex-col sm:flex-row gap-3">
              {([
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'system', icon: Monitor, label: 'System' },
              ] as const).map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleChange(setTheme)(option.value)}
                  className={`flex-1 py-3 px-4 rounded-lg border transition-all flex flex-col items-center gap-2 ${
                    theme === option.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-surface-200 hover:border-surface-300'
                  }`}
                >
                  <option.icon className="w-5 h-5" />
                  <span className="text-sm font-sans font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Account Section */}
        <section className="card">
          <h2 className="text-lg font-serif font-medium text-surface-900 mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            Account
          </h2>

          <div className="space-y-4">
            <div>
              <p className="font-medium text-surface-900 text-sm mb-1">Sign out</p>
              <p className="text-xs text-surface-500 font-sans mb-3">
                Sign out of your account on this device
              </p>
              <button
                onClick={() => signOut()}
                className="btn btn-secondary"
              >
                Sign Out
              </button>
            </div>

            <hr className="border-surface-200" />

            <div>
              <p className="font-medium text-red-600 text-sm mb-1">Danger Zone</p>
              <p className="text-xs text-surface-500 font-sans mb-3">
                Permanently delete your account and all data
              </p>
              <button className="btn bg-red-50 text-red-600 hover:bg-red-100">
                Delete Account
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

