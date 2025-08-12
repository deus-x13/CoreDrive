"use client"

const TextInputComponent = ({ value, onChange, placeholder, label }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">{label}</label>
      <textarea
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        placeholder={placeholder}
      />
      <p className="text-xs text-gray-500 mt-1">Characters: {value.length}</p>
    </div>
  )
}

export default TextInputComponent
