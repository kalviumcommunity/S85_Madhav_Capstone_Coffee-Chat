import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MapPin, Users, Calendar, Eye, Clock } from 'lucide-react';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const SearchResults = ({ user, setUser }) => {
  const query = useQuery().get('query') || '';
  const [groups, setGroups] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    Promise.all([
      fetch('http://localhost:3000/api/groups').then(res => res.json()),
      fetch('http://localhost:3000/api/events').then(res => res.json()),
    ]).then(([groupsData, eventsData]) => {
      setGroups(
        groupsData.filter(group =>
          group.name.toLowerCase().includes(query.toLowerCase()) ||
          group.description.toLowerCase().includes(query.toLowerCase()) ||
          group.city.toLowerCase().includes(query.toLowerCase()) ||
          (group.category && group.category.toLowerCase().includes(query.toLowerCase()))
        )
      );
      setEvents(
        eventsData.filter(event =>
          event.name.toLowerCase().includes(query.toLowerCase()) ||
          event.description.toLowerCase().includes(query.toLowerCase()) ||
          event.city.toLowerCase().includes(query.toLowerCase()) ||
          (event.category && event.category.toLowerCase().includes(query.toLowerCase()))
        )
      );
      setLoading(false);
    });
  }, [query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-orange-700">Search Results for "{query}"</h1>
        {loading ? (
          <div className="text-center text-lg text-gray-500 py-20">Loading...</div>
        ) : (
          <>
            <section className="mb-16">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Groups</h2>
              {groups.length === 0 ? (
                <div className="text-gray-500 text-center mb-8">No groups found matching your search.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {groups.map(group => (
                    <Link
                      key={group._id}
                      to={`/groups/${group._id}`}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden border border-white/20"
                    >
                      <div className="relative">
                        <img
                          src={group.image || 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                          alt={group.name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-orange-100 text-orange-700">
                            {group.category}
                          </span>
                        </div>
                        <div className="absolute top-4 right-4">
                          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                            <Eye className="w-4 h-4 inline mr-1" />
                            {group.memberCount || group.members?.length || 0}
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-200">
                          {group.name}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {group.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{group.city}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{group.memberCount || group.members?.length || 0} members</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
            <section>
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Events</h2>
              {events.length === 0 ? (
                <div className="text-gray-500 text-center mb-8">No events found matching your search.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {events.map(event => (
                    <Link
                      key={event._id}
                      to={`/events/${event._id}`}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden border border-white/20"
                    >
                      <div className="relative">
                        <img
                          src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                          alt={event.name}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-orange-100 text-orange-700">
                            {event.category}
                          </span>
                        </div>
                        <div className="absolute top-4 right-4">
                          <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {new Date(event.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-200">
                          {event.name}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{event.city}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{event.attendeeCount || event.attendees?.length || 0} attendees</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default SearchResults; 