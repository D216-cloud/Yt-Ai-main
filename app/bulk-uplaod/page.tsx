import Link from "next/link"
import { Header } from "@/components/header"
import { NavMenu } from "@/components/nav-menu"
import { Upload } from "lucide-react"

export default function BulkUplaodPage() {
  return (
    <div>
      <Header />
      <div className="flex">
        {/* Sidebar area */}
        <aside className="hidden md:block w-64 border-r border-gray-200 bg-white fixed left-0 top-16 bottom-0 overflow-y-auto">
          <div className="p-4">
            <NavMenu activePage="bulk-uplaod" />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-64 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 border border-gray-200 p-6">
              <h1 className="text-2xl font-bold">Bulk Upload</h1>
              <p className="text-sm text-gray-600 mt-1">Upload video batches to multiple channels from one place.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-white">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Manage bulk uploads</h2>
                  <p className="text-sm text-gray-600">This page is a dedicated, top-level bulk upload workspace (separate from the Dashboard).</p>
                </div>
              </div>

              <div className="border-dashed border-2 border-gray-200 rounded-xl p-8 text-center">
                <p className="text-gray-600 mb-4">You can implement your bulk-upload UI here (select files, map channels, set titles/descriptions, and start uploads).</p>
                <Link href="/connect">
                  <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg">
                    Connect Channels
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
