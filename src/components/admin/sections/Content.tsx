import React, { useState } from 'react';
import { FileText, Search, Filter, Eye, Trash2, Edit, Plus, Volume2 } from 'lucide-react';

interface ContentItem {
  id: string;
  title: string;
  type: 'story' | 'image' | 'audio';
  status: 'published' | 'draft' | 'archived';
  author: string;
  created: string;
  views: number;
}

const Content: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Sample content data
  const contentItems: ContentItem[] = [
    {
      id: '1',
      title: 'The Magical Forest Adventure',
      type: 'story',
      status: 'published',
      author: 'Jane Smith',
      created: '2023-07-15',
      views: 1245
    },
    {
      id: '2',
      title: 'Space Explorer: Journey to Mars',
      type: 'story',
      status: 'published',
      author: 'John Doe',
      created: '2023-07-10',
      views: 982
    },
    {
      id: '3',
      title: 'Enchanted Castle Background',
      type: 'image',
      status: 'published',
      author: 'Alice Johnson',
      created: '2023-07-05',
      views: 567
    },
    {
      id: '4',
      title: 'Mysterious Jungle Sounds',
      type: 'audio',
      status: 'draft',
      author: 'Bob Williams',
      created: '2023-07-01',
      views: 0
    },
    {
      id: '5',
      title: 'Underwater Kingdom',
      type: 'story',
      status: 'draft',
      author: 'Jane Smith',
      created: '2023-06-28',
      views: 0
    },
    {
      id: '6',
      title: "Dragon's Roar",
      type: 'audio',
      status: 'archived',
      author: 'John Doe',
      created: '2023-06-20',
      views: 321
    }
  ];
  
  const filteredContent = contentItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-600 text-white';
      case 'draft':
        return 'bg-yellow-600 text-white';
      case 'archived':
        return 'bg-gray-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'story':
        return <FileText className="h-5 w-5 text-blue-400" />;
      case 'image':
        return <Eye className="h-5 w-5 text-purple-400" />;
      case 'audio':
        return <Volume2 className="h-5 w-5 text-green-400" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Content Management</h2>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Content
        </button>
      </div>
      
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-700 text-white rounded-lg pl-10 pr-4 py-2"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-700 text-white rounded-lg pl-10 pr-4 py-2 appearance-none"
              >
                <option value="all">All Types</option>
                <option value="story">Stories</option>
                <option value="image">Images</option>
                <option value="audio">Audio</option>
              </select>
              <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
            
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-700 text-white rounded-lg pl-10 pr-4 py-2 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
              <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-white">Title</th>
                <th className="px-6 py-3 text-left text-white">Type</th>
                <th className="px-6 py-3 text-left text-white">Status</th>
                <th className="px-6 py-3 text-left text-white">Author</th>
                <th className="px-6 py-3 text-left text-white">Created</th>
                <th className="px-6 py-3 text-left text-white">Views</th>
                <th className="px-6 py-3 text-left text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContent.map((item) => (
                <tr key={item.id} className="border-b border-slate-700">
                  <td className="px-6 py-4 text-white flex items-center gap-2">
                    {getTypeIcon(item.type)}
                    {item.title}
                  </td>
                  <td className="px-6 py-4 text-gray-300 capitalize">{item.type}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${getStatusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{item.author}</td>
                  <td className="px-6 py-4 text-gray-300">{item.created}</td>
                  <td className="px-6 py-4 text-gray-300">{item.views}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-400 hover:text-blue-300">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button className="text-green-400 hover:text-green-300">
                        <Eye className="h-5 w-5" />
                      </button>
                      <button className="text-red-400 hover:text-red-300">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredContent.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400">No content found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Content;