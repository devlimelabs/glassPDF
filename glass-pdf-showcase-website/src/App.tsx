import { useState, useEffect } from 'react'
import { Download, Chrome, FileText, Zap, Shield, Sparkles, Github, Star, Eye, Settings, MousePointer } from 'lucide-react'
import './App.css'

function App() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: <Sparkles className="w-8 h-8" />,
      title: "Glass-Morphic Interface",
      description: "Beautiful, modern UI with blur effects and smooth animations"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Pixel-Perfect PDFs",
      description: "High-quality PDF generation with canvas-based rendering"
    },
    {
      icon: <MousePointer className="w-8 h-8" />,
      title: "Interactive Tools",
      description: "Drag-and-drop page breaks and element exclusion"
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Advanced Settings",
      description: "Custom page sizes, orientations, and quality options"
    }
  ]

  const downloadExtension = () => {
    // In a real implementation, this would download the extension
    alert('Extension download would start here. For demo, check the chrome-pdf-extension folder.')
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      
      <div className="relative">
        {/* Header */}
        <header className="backdrop-blur-md bg-white/10 border-b border-white/20 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  Glass PDF Generator
                </h1>
              </div>
              <nav className="hidden md:flex space-x-6">
                <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
                <a href="#download" className="text-white/80 hover:text-white transition-colors">Download</a>
                <a href="#support" className="text-white/80 hover:text-white transition-colors">Support</a>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-block p-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 mb-8">
                <div className="bg-black/20 backdrop-blur-md rounded-full px-6 py-2">
                  <span className="text-white text-sm font-medium">🎉 Now Available for Chrome</span>
                </div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent leading-tight">
                Transform Web Pages<br />into Beautiful PDFs
              </h1>
              
              <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed">
                A modern Chrome extension with glass-morphic design that generates pixel-perfect PDFs 
                from any web page with advanced customization tools.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <button 
                  onClick={downloadExtension}
                  className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-4 rounded-2xl font-semibold flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                  <Chrome className="w-6 h-6" />
                  <span>Add to Chrome</span>
                  <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                </button>
                
                <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-3">
                  <Github className="w-6 h-6" />
                  <span>View Source</span>
                </button>
              </div>

              {/* Demo Preview */}
              <div className="relative max-w-4xl mx-auto">
                <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 border border-slate-700">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <div className="flex-1 bg-slate-700 rounded-md mx-4 h-6 flex items-center px-3">
                        <span className="text-slate-400 text-xs">Glass PDF Generator Extension</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-4 bg-gradient-to-r from-indigo-400 to-purple-500 rounded w-3/4 opacity-80"></div>
                      <div className="h-3 bg-slate-600 rounded w-1/2"></div>
                      <div className="h-3 bg-slate-600 rounded w-2/3"></div>
                      <div className="flex space-x-4 mt-6">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 rounded-lg text-white text-sm font-medium">
                          Generate PDF
                        </div>
                        <div className="bg-slate-700 border border-slate-600 px-4 py-2 rounded-lg text-slate-300 text-sm">
                          Advanced
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Why Choose Glass PDF?
              </h2>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Experience the next generation of PDF generation with modern design and powerful features.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 transition-all duration-500 hover:bg-white/20 hover:scale-105 ${
                    activeFeature === index ? 'ring-2 ring-indigo-400 bg-white/20' : ''
                  }`}
                >
                  <div className={`w-16 h-16 rounded-2xl mb-4 flex items-center justify-center transition-colors duration-300 ${
                    activeFeature === index 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' 
                      : 'bg-white/10 text-white/70'
                  }`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-white/70">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl p-12">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent mb-2">
                    300 DPI
                  </div>
                  <div className="text-white/70 font-medium">Print Quality</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-2">
                    99.9%
                  </div>
                  <div className="text-white/70 font-medium">Accuracy Rate</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent mb-2">
                    50+
                  </div>
                  <div className="text-white/70 font-medium">Supported Formats</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section id="download" className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
              Install the Glass PDF Generator extension and start creating beautiful PDFs in seconds.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={downloadExtension}
                className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-10 py-5 rounded-2xl font-semibold flex items-center justify-center space-x-3 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl text-lg"
              >
                <Chrome className="w-7 h-7" />
                <span>Download Extension</span>
                <Download className="w-6 h-6 group-hover:translate-y-1 transition-transform" />
              </button>
              
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-2xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-3 text-lg">
                <Eye className="w-7 h-7" />
                <span>View Demo</span>
              </button>
            </div>

            <div className="mt-12 backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-white mb-4">Installation Instructions</h3>
              <ol className="text-left text-white/70 space-y-2">
                <li>1. Download the extension files</li>
                <li>2. Open Chrome and go to chrome://extensions/</li>
                <li>3. Enable "Developer mode"</li>
                <li>4. Click "Load unpacked" and select the extension folder</li>
                <li>5. Start generating beautiful PDFs!</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 px-4 border-t border-white/20">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white">Glass PDF Generator</h3>
            </div>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              Transform any web page into a beautiful PDF with modern design and advanced features.
            </p>
            <div className="flex justify-center space-x-6 mb-8">
              <Github className="w-6 h-6 text-white/70 hover:text-white cursor-pointer transition-colors" />
              <Star className="w-6 h-6 text-white/70 hover:text-white cursor-pointer transition-colors" />
              <Shield className="w-6 h-6 text-white/70 hover:text-white cursor-pointer transition-colors" />
            </div>
            <p className="text-white/50 text-sm">
              Made with ❤️ for the web development community
            </p>
          </div>
        </footer>
        </div>
      </div>
    </>
  )
}

export default App