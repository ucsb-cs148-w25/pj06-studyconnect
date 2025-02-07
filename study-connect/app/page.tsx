export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">Welcome to Study Connect</h1>
        <p className="text-xl text-gray-600">
          Connect with fellow UCSB students, form study groups, and excel together in your academic journey.
        </p>
        
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Find Study Partners</h2>
            <p className="text-gray-600">Connect with students in your courses and form study groups.</p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Share Resources</h2>
            <p className="text-gray-600">Exchange study materials and collaborate on course content.</p>
          </div>
          
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Track Progress</h2>
            <p className="text-gray-600">Monitor your study sessions and academic improvement.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
