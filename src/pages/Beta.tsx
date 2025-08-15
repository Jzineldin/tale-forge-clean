
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Rocket, 
  Users, 
  MessageSquare, 
  Star, 
  TrendingUp, 
  Zap,
  BookOpen,
  Heart
} from 'lucide-react';

const Beta: React.FC = () => {
  const navigate = useNavigate();

  const betaFeatures = [
    {
      icon: <Rocket className="h-6 w-6" />,
      title: "AI Story Generation",
      description: "Advanced AI creates immersive, personalized stories",
      status: "Active",
      color: "bg-green-500"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Stories",
      description: "Discover and share stories with other creators",
      status: "Beta",
      color: "bg-blue-500"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Interactive Choices",
      description: "Shape your story with meaningful decisions",
      status: "Active",
      color: "bg-green-500"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Story Ratings",
      description: "Rate and review community stories",
      status: "Coming Soon",
      color: "bg-yellow-500"
    }
  ];

  const stats = [
    { label: "Stories Created", value: "1,200+", icon: <BookOpen className="h-5 w-5" /> },
    { label: "Active Users", value: "450+", icon: <Users className="h-5 w-5" /> },
    { label: "Community Likes", value: "3,200+", icon: <Heart className="h-5 w-5" /> },
    { label: "Avg Rating", value: "4.8/5", icon: <Star className="h-5 w-5" /> }
  ];

  return (
    <div 
      className="min-h-screen bg-slate-900"
      style={{
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('/images/Flux_Dev_Lonely_astronaut_sitting_on_a_pile_of_books_in_space__0.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-4">
            Beta Dashboard
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 font-serif">
            Welcome to <span className="text-amber-400">Tale Forge Beta</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            You're part of an exclusive group shaping the future of interactive storytelling
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-slate-800/90 border-slate-600 backdrop-blur-sm text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-2 text-amber-400">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Beta Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Beta Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {betaFeatures.map((feature, index) => (
              <Card key={index} className="bg-slate-800/90 border-slate-600 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-amber-400">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-white">{feature.title}</CardTitle>
                    </div>
                    <Badge className={`${feature.color} text-white`}>
                      {feature.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-amber-400 backdrop-blur-sm">
            <CardHeader className="text-center">
              <Zap className="h-8 w-8 text-amber-400 mx-auto mb-2" />
              <CardTitle className="text-white">Create Story</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-4">
                Start your next interactive adventure
              </p>
              <Button
                onClick={() => navigate('/create/genre')}
                className="bg-amber-500 hover:bg-amber-600 text-white w-full"
              >
                Create Now
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-400 backdrop-blur-sm">
            <CardHeader className="text-center">
              <TrendingUp className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <CardTitle className="text-white">Discover</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-4">
                Explore community stories
              </p>
              <Button
                onClick={() => navigate('/discover')}
                variant="outline"
                className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white w-full"
              >
                Explore
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-teal-500/20 border-green-400 backdrop-blur-sm">
            <CardHeader className="text-center">
              <BookOpen className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <CardTitle className="text-white">My Stories</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-300 mb-4">
                Manage your story collection
              </p>
              <Button
                onClick={() => navigate('/my-stories')}
                variant="outline"
                className="border-green-400 text-green-400 hover:bg-green-400 hover:text-white w-full"
              >
                View Library
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Feedback */}
        <Card className="bg-slate-800/90 border-slate-600 backdrop-blur-sm mt-12">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-2xl">Help Us Improve</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-6">
              Your feedback is invaluable as we build the future of interactive storytelling. 
              Share your thoughts, report bugs, or suggest new features.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.open('mailto:feedback@taleforge.app?subject=Beta Feedback')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Feedback
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open('https://discord.gg/taleforge', '_blank')}
                className="border-slate-600 text-gray-300 hover:bg-slate-700"
              >
                Join Discord
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Beta;
