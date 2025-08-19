export default function TripcodeManagement({
  savedPasswords,
  setSavedPasswords,
  tripPassword,
  setTripPassword,
  isUsingTrip,
  setIsUsingTrip
}) {
  const saveCurrentPassword = () => {
    if (tripPassword && !savedPasswords.includes(tripPassword)) {
      const newPasswords = [...savedPasswords, tripPassword];
      setSavedPasswords(newPasswords);
      localStorage.setItem('tripPasswords', JSON.stringify(newPasswords));
    }
  };

  const loadPassword = (password) => {
    setTripPassword(password);
    setIsUsingTrip(true);
  };

  const removePassword = (passwordToRemove) => {
    const newPasswords = savedPasswords.filter(p => p !== passwordToRemove);
    setSavedPasswords(newPasswords);
    localStorage.setItem('tripPasswords', JSON.stringify(newPasswords));
    
    // If we're removing the currently selected password, clear it
    if (tripPassword === passwordToRemove) {
      setTripPassword('');
      setIsUsingTrip(false);
    }
  };

  if (savedPasswords.length === 0 && !tripPassword) {
    return null;
  }

  return (
    <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Tripcode Management
      </h3>
      
      {/* Current password save button */}
      {tripPassword && !savedPasswords.includes(tripPassword) && (
        <div className="mb-4">
          <button
            onClick={saveCurrentPassword}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
          >
            Save Current Password
          </button>
        </div>
      )}

      {/* Saved passwords */}
      {savedPasswords.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Saved Passwords:
          </h4>
          <div className="space-y-2">
            {savedPasswords.map((password, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-md p-2">
                <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                  {'*'.repeat(password.length)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadPassword(password)}
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Use
                  </button>
                  <button
                    onClick={() => removePassword(password)}
                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
