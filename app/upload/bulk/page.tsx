import { redirect } from 'next/navigation'

export default function Page() {
  // Permanently removed: redirect to AI Tools (keeps route usable but no content)
  redirect('/ai-tools')
}


interface YouTubeChannel {
  id: string
  title: string
  description: string
  import { redirect } from 'next/navigation'

  export default function Page() {
    // Bulk upload removed: redirect to AI Tools
    redirect('/ai-tools')
  }
    }
    
    if (storedChannels) {
      try {
        const additionalChannels = JSON.parse(storedChannels)
        additionalChannels.forEach((ch: YouTubeChannel) => {
          if (!allChannels.find(c => c.id === ch.id)) {
            allChannels.push(ch)
          import { redirect } from 'next/navigation'

          export default function BulkUploadPage() {
            redirect('/ai-tools')
          }
        title: titleTemplate.replace("{filename}", file.name.replace(/\.[^/.]+$/, "")),
        description: descriptionTemplate,
        tags: [...tagsTemplate],
        privacyStatus
      }))
      setVideoFiles(prev => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setVideoFiles(prev => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (newTag.trim() && !tagsTemplate.includes(newTag.trim())) {
      setTagsTemplate([...tagsTemplate, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTagsTemplate(tagsTemplate.filter(tag => tag !== tagToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const toggleChannelSelection = (channel: YouTubeChannel) => {
    if (selectedChannels.some(c => c.id === channel.id)) {
      setSelectedChannels(selectedChannels.filter(c => c.id !== channel.id))
    } else {
      setSelectedChannels([...selectedChannels, channel])
    }
  }

  const handleUpload = async () => {
    if (videoFiles.length === 0 || selectedChannels.length === 0) return
    
    setIsUploading(true)
    setUploadProgress(0)
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        import { redirect } from 'next/navigation'

        export default function Page() {
          // Page removed: always redirect to the AI Tools page
          redirect('/ai-tools')
        }
                <span className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <LogOut className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="hidden md:block sticky top-0 z-40 border-b border-gray-200 bg-white h-16">
        <div className="flex h-16 items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 shadow-lg group-hover:shadow-xl transition flex-shrink-0">
              <Play className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">YouTubeAI Pro</span>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 border-l border-gray-200 pl-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{session?.user?.name || "Creator Studio"}</p>
                <p className="text-xs text-gray-500">{session?.user?.email || "Premium Plan"}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-blue-200 shadow-md flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {session?.user?.name?.[0]?.toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || "U"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 md:hidden z-30 top-16" onClick={() => setSidebarOpen(false)}></div>
        )}

        {/* Mobile Sidebar */}
        <aside
          className={`fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 md:hidden z-40 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="p-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition text-sm ${
                    link.id === "ai-tools"
                      ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-700 border border-blue-300/50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg bg-transparent border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Sign Out</span>
                </>
              )}
            </Button>
          </div>
        </aside>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 border-r border-gray-200 bg-white fixed left-0 top-16 bottom-0 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition text-sm ${
                    link.id === "ai-tools"
                      ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-700 border border-blue-300/50 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={handleSignOut}
              disabled={isLoading}
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg bg-transparent border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                  Signing Out...
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Sign Out</span>
                </>
              )}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-64 pb-20 md:pb-0">
          <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-6 md:mb-8 rounded-xl md:rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 p-4 md:p-8">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8 text-purple-600" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bulk Upload</h1>
              </div>
              <p className="text-sm md:text-base text-gray-700">
                Upload multiple videos simultaneously to one or more channels
              </p>
              <Breadcrumb items={[{ label: 'Bulk Upload', href: '/ai-tools' }, { label: 'Bulk Upload' }]} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Video Upload and Templates */}
              <div className="lg:col-span-2 space-y-6">
                {/* Video Files Selection */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Video className="w-5 h-5 text-blue-600" />
                    Video Files
                  </h2>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors mb-6">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Select Videos</h3>
                    <p className="text-gray-600 mb-4">Choose multiple video files to upload</p>
                    <label className="inline-block">
                      <input
                        type="file"
                        multiple
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        ref={fileInputRef}
                      />
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-600 text-white font-semibold">
                        <Plus className="w-4 h-4 mr-2" />
                        Select Videos
                      </Button>
                    </label>
                    <p className="text-gray-500 text-sm mt-3">
                      Supported formats: MP4, MOV, AVI, WMV
                    </p>
                  </div>

                  {/* Selected Files */}
                  {videoFiles.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Selected Videos ({videoFiles.length})</h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {videoFiles.map((video, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Video className="w-8 h-8 text-gray-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{video.name}</p>
                              <p className="text-xs text-gray-500">
                                {(video.size / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Templates */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Templates
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Type className="w-4 h-4" />
                        Title Template
                      </label>
                      <input
                        type="text"
                        value={titleTemplate}
                        onChange={(e) => setTitleTemplate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter title template"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Use {"{filename}"} to include the original filename
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <AlignLeft className="w-4 h-4" />
                        Description Template
                      </label>
                      <textarea
                        value={descriptionTemplate}
                        onChange={(e) => setDescriptionTemplate(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter description template"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Tags Template
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Add a tag"
                        />
                        <Button 
                          onClick={addTag}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-600 text-white"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tagsTemplate.map((tag, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {tag}
                            <button 
                              onClick={() => removeTag(tag)}
                              className="hover:text-blue-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Channel Selection and Upload */}
              <div className="space-y-6">
                {/* Channel Selection */}
                {channels.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Youtube className="w-5 h-5 text-red-600" />
                      Select Channels
                    </h2>
                    <div className="space-y-3">
                      {channels.map((channel) => (
                        <button
                          key={channel.id}
                          onClick={() => toggleChannelSelection(channel)}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                            selectedChannels.some(c => c.id === channel.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <img
                            src={channel.thumbnail}
                            alt={channel.title}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="text-left flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm truncate">{channel.title}</h3>
                            <p className="text-xs text-gray-600 truncate">
                              {formatNumber(channel.subscriberCount)} subscribers
                            </p>
                          </div>
                          {selectedChannels.some(c => c.id === channel.id) && (
                            <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Selected: {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {/* Privacy and Schedule */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-blue-600" />
                    Privacy & Schedule
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Privacy Status
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => setPrivacyStatus('public')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            privacyStatus === 'public'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Globe className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                          <span className="text-sm font-medium">Public</span>
                        </button>
                        <button
                          onClick={() => setPrivacyStatus('unlisted')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            privacyStatus === 'unlisted'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Hash className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                          <span className="text-sm font-medium">Unlisted</span>
                        </button>
                        <button
                          onClick={() => setPrivacyStatus('private')}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            privacyStatus === 'private'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Lock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                          <span className="text-sm font-medium">Private</span>
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Schedule Upload (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave blank to upload immediately
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upload Button */}
                {videoFiles.length > 0 && selectedChannels.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Upload</h2>
                    
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3"
                    >
                      {isUploading ? (
                        <>
                          <span className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Uploading... {uploadProgress}%
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload {videoFiles.length} Video{videoFiles.length !== 1 ? 's' : ''}
                        </>
                      )}
                    </Button>
                    
                    {isUploading && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 text-sm text-gray-600">
                      <p>Uploading to {selectedChannels.length} channel{selectedChannels.length !== 1 ? 's' : ''}</p>
                      <p className="mt-1">Each video will use the templates above</p>
                    </div>
                  </div>
                )}

                {/* Upload Tips */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 rounded-2xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Tips</h2>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">
                        Videos should be in MP4 format with H.264 codec for best compatibility
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">
                        Recommended resolution: 1920x1080 (1080p) or higher
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">
                        File size limit: 128GB for long videos, 2GB for Shorts
                      </p>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">
                        Use templates to maintain consistency across uploads
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Only show sidebar button */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
        <div className="flex justify-center py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-3 rounded-full"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>
    </div>
  )
}