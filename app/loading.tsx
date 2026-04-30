const Loading = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <span className="flex items-center gap-1.5">
        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:300ms]" />
      </span>
    </div>
  )
}

export default Loading