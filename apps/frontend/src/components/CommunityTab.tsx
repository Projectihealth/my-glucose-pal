import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Plus, Filter, TrendingUp, Bookmark, Play, BookOpen, Headphones, Video, Clock, CheckCircle2, Users, Sparkles, ChevronRight, X, Send, Image as ImageIcon, Smile, Trophy, Flame, Medal, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { TabHeader } from './TabHeader';
import { useNavigate } from 'react-router-dom';

type MainTab = 'feed' | 'leaderboard' | 'resources';
type FeedFilter = 'all' | 'following' | 'popular';
type ResourceType = 'all' | 'articles' | 'podcasts' | 'videos';
type ResourceCategory = 'all' | 'weight' | 'glucose' | 'fitness';

interface Comment {
  id: string;
  user: {
    name: string;
    initials: string;
  };
  timestamp: string;
  content: string;
  likes: number;
  isLiked: boolean;
}

interface CommunityPost {
  id: string;
  user: {
    name: string;
    initials: string;
    avatar?: string;
  };
  timestamp: string;
  title: string;
  content: string;
  tags: string[];
  likes: number;
  comments: Comment[];
  isLiked: boolean;
  isBookmarked: boolean;
}

interface Resource {
  id: string;
  type: 'article' | 'podcast' | 'video';
  category: 'weight' | 'glucose' | 'fitness';
  title: string;
  description: string;
  duration: string;
  thumbnail?: string;
  progress?: number;
  isCompleted: boolean;
  author?: string;
}

interface LeaderboardUser {
  id: string;
  name: string;
  initials: string;
  streak: number; // max 30 days
  rank: number;
  isCurrentUser: boolean;
  avatar?: string;
  participationScore: number; // comprehensive score based on streaks, chatting, and to-dos
  coachingChats: number; // number of Olivia conversations
  todosCompleted: number; // number of completed to-dos
}

const mockPosts: CommunityPost[] = [
  {
    id: '1',
    user: { name: 'Riley P.', initials: 'RP' },
    timestamp: '2h ago',
    title: 'Shifted dinner to 6pm and added a 15-minute walk',
    content: 'My overnight highs flattened out after I prepped lighter meals and scheduled a post-dinner walk. My coach suggested it, but hearing others doing it helped me commit.',
    tags: ['OVERNIGHT HIGHS', 'MOVEMENT', 'MEAL TIMING'],
    likes: 24,
    comments: [
      {
        id: 'c1',
        user: { name: 'Sarah M.', initials: 'SM' },
        timestamp: '1h ago',
        content: 'This is so helpful! I\'ve been struggling with overnight highs too. What time do you usually eat dinner?',
        likes: 3,
        isLiked: false,
      },
      {
        id: 'c2',
        user: { name: 'David K.', initials: 'DK' },
        timestamp: '45m ago',
        content: 'I tried this last week and it made a huge difference! Thanks for sharing 🙌',
        likes: 5,
        isLiked: true,
      }
    ],
    isLiked: false,
    isBookmarked: false,
  },
  {
    id: '2',
    user: { name: 'Maribel L.', initials: 'ML' },
    timestamp: '5h ago',
    title: 'Fiber-first breakfast changed my mornings',
    content: 'I now eat chia pudding before coffee. Olivia surfaced 3 similar wins from the community and it convinced me to try it. My morning spikes are down by 35 mg/dL.',
    tags: ['MORNING SPIKE', 'NUTRITION', 'OLIVIA TIP'],
    likes: 42,
    comments: [
      {
        id: 'c3',
        user: { name: 'Emma R.', initials: 'ER' },
        timestamp: '4h ago',
        content: 'Amazing results! Do you make your chia pudding the night before?',
        likes: 2,
        isLiked: false,
      }
    ],
    isLiked: true,
    isBookmarked: true,
  },
  {
    id: '3',
    user: { name: 'James K.', initials: 'JK' },
    timestamp: '1d ago',
    title: 'Discovered the power of resistance training',
    content: 'Added 20 minutes of bodyweight exercises 3x per week. My glucose stability improved dramatically and I feel stronger. The community\'s success stories motivated me to start.',
    tags: ['STRENGTH TRAINING', 'GLUCOSE STABILITY', 'FITNESS'],
    likes: 56,
    comments: [],
    isLiked: false,
    isBookmarked: false,
  },
];

const mockResources: Resource[] = [
  {
    id: 'a1',
    type: 'article',
    category: 'glucose',
    title: 'Meet Your CGM Coach, Olivia',
    description: 'Discover how Olivia weaves CGM trends, coaching insights, and community support into your daily routine.',
    duration: '8 min read',
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'a2',
    type: 'article',
    category: 'glucose',
    title: 'CGM Foundations',
    description: 'Understand how sensors track glucose, what key metrics mean, and how to respond in real time.',
    duration: '6 min read',
    progress: 45,
    isCompleted: false,
  },
  {
    id: 'a3',
    type: 'article',
    category: 'weight',
    title: 'Sustainable Weight Loss Strategies',
    description: 'Evidence-based approaches to losing weight and keeping it off through lifestyle changes.',
    duration: '10 min read',
    progress: 100,
    isCompleted: true,
  },
  {
    id: 'p1',
    type: 'podcast',
    category: 'glucose',
    title: 'Understanding Glucose Spikes',
    description: 'Dr. Sarah Chen explains what causes post-meal spikes and practical strategies to minimize them.',
    duration: '28 min',
    progress: 0,
    isCompleted: false,
    author: 'Dr. Sarah Chen',
  },
  {
    id: 'p2',
    type: 'podcast',
    category: 'fitness',
    title: 'Building Exercise Habits That Stick',
    description: 'Learn from behavioral psychologist Dr. Mike Johnson about creating sustainable fitness routines.',
    duration: '35 min',
    progress: 60,
    isCompleted: false,
    author: 'Dr. Mike Johnson',
  },
  {
    id: 'v1',
    type: 'video',
    category: 'fitness',
    title: '15-Minute Post-Meal Walk Guide',
    description: 'Follow along with this guided walking routine designed to improve glucose control after eating.',
    duration: '15 min',
    progress: 0,
    isCompleted: false,
  },
  {
    id: 'v2',
    type: 'video',
    category: 'glucose',
    title: 'How to Read Your CGM Data',
    description: 'Visual guide to interpreting your continuous glucose monitor readings and patterns.',
    duration: '12 min',
    progress: 100,
    isCompleted: true,
  },
];

const mockLeaderboard: LeaderboardUser[] = [
  // Participation Score = (streak * 10) + (coachingChats * 5) + (todosCompleted * 2)
  { id: '1', name: 'Sarah C', initials: 'SC', streak: 30, rank: 1, isCurrentUser: false, participationScore: 410, coachingChats: 12, todosCompleted: 25 },
  { id: '2', name: 'Michael T', initials: 'MT', streak: 28, rank: 2, isCurrentUser: false, participationScore: 399, coachingChats: 15, todosCompleted: 22 },
  { id: '3', name: 'Emma R', initials: 'ER', streak: 30, rank: 3, isCurrentUser: false, participationScore: 398, coachingChats: 10, todosCompleted: 24 },
  { id: '4', name: 'David K', initials: 'DK', streak: 25, rank: 4, isCurrentUser: false, participationScore: 335, coachingChats: 9, todosCompleted: 20 },
  { id: '5', name: 'Yijia L', initials: 'YO', streak: 23, rank: 5, isCurrentUser: true, participationScore: 321, coachingChats: 11, todosCompleted: 18 },
  { id: '6', name: 'Olivia M', initials: 'OM', streak: 21, rank: 6, isCurrentUser: false, participationScore: 305, coachingChats: 13, todosCompleted: 15 },
  { id: '7', name: 'James W', initials: 'JW', streak: 19, rank: 7, isCurrentUser: false, participationScore: 262, coachingChats: 8, todosCompleted: 16 },
  { id: '8', name: 'Lisa A', initials: 'LA', streak: 17, rank: 8, isCurrentUser: false, participationScore: 248, coachingChats: 10, todosCompleted: 14 },
  { id: '9', name: 'Ryan P', initials: 'RP', streak: 15, rank: 9, isCurrentUser: false, participationScore: 209, coachingChats: 7, todosCompleted: 12 },
  { id: '10', name: 'Sophia L', initials: 'SL', streak: 12, rank: 10, isCurrentUser: false, participationScore: 187, coachingChats: 9, todosCompleted: 11 },
];

export function CommunityTab() {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState<MainTab>('leaderboard');
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all');
  const [resourceType, setResourceType] = useState<ResourceType>('all');
  const [resourceCategory, setResourceCategory] = useState<ResourceCategory>('all');
  const [posts, setPosts] = useState<CommunityPost[]>(mockPosts);
  const [resources] = useState<Resource[]>(mockResources);
  const [leaderboard] = useState<LeaderboardUser[]>(mockLeaderboard);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showComments, setShowComments] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  const allTags = ['OVERNIGHT HIGHS', 'MOVEMENT', 'MEAL TIMING', 'MORNING SPIKE', 'NUTRITION', 'OLIVIA TIP', 'STRENGTH TRAINING', 'GLUCOSE STABILITY', 'FITNESS', 'WEIGHT LOSS', 'SLEEP', 'STRESS'];

  const handleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  const handleCommentLike = (postId: string, commentId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments.map(comment =>
                comment.id === commentId
                  ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 }
                  : comment
              ),
            }
          : post
      )
    );
  };

  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    const comment: Comment = {
      id: Date.now().toString(),
      user: { name: 'You', initials: 'YO' },
      timestamp: 'Just now',
      content: newComment,
      likes: 0,
      isLiked: false,
    };

    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, comment] }
          : post
      )
    );

    setNewComment('');
    toast.success('Comment added!');
  };

  const handleBookmark = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
    const post = posts.find(p => p.id === postId);
    if (post) {
      toast.success(post.isBookmarked ? 'Removed from bookmarks' : 'Saved to bookmarks');
    }
  };

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error('Please add a title and content');
      return;
    }

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      user: { name: 'You', initials: 'YO' },
      timestamp: 'Just now',
      title: newPostTitle,
      content: newPostContent,
      tags: selectedTags,
      likes: 0,
      comments: [],
      isLiked: false,
      isBookmarked: false,
    };

    setPosts(prev => [newPost, ...prev]);
    setShowCreatePost(false);
    setNewPostTitle('');
    setNewPostContent('');
    setSelectedTags([]);
    toast.success('Post shared with the community!');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Filter and sort posts
  const filteredAndSortedPosts = (() => {
    let filtered = posts;
    
    if (feedFilter === 'popular') {
      // Sort by likes in descending order
      filtered = [...posts].sort((a, b) => b.likes - a.likes);
    }
    
    return filtered;
  })();

  const filteredResources = resources.filter(resource => {
    const typeMatch = resourceType === 'all' || resource.type === resourceType.slice(0, -1) as 'article' | 'podcast' | 'video';
    const categoryMatch = resourceCategory === 'all' || resource.category === resourceCategory;
    return typeMatch && categoryMatch;
  });

  const handleResourceClick = (resource: Resource) => {
    // Navigate to specific articles
    if (resource.id === 'a1') {
      navigate('/learn-more/user-guide');
    } else if (resource.id === 'a2') {
      navigate('/learn-more/cgm-foundations');
    } else if (resource.id === 'a3') {
      navigate('/learn-more/weight-loss');
    } else {
      // For other resources, show a toast (placeholder for future implementation)
      toast.info('This resource is coming soon!');
    }
  };

  const getResourceTypeIcon = (type: 'article' | 'podcast' | 'video') => {
    switch (type) {
      case 'article':
        return <BookOpen className="w-3 h-3" />;
      case 'podcast':
        return <Headphones className="w-3 h-3" />;
      case 'video':
        return <Video className="w-3 h-3" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24">
      {/* Header */}
      <div className="bg-white sticky top-0 z-40 border-b border-gray-100">
        <TabHeader
          eyebrow="Community"
          title="Share Your Journey"
          subtitle="Learn more about how to achieve your goal"
          className="pb-4"
        />

        {/* Main Tab Switcher */}
        <div className="px-6">
          <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
            <button
            onClick={() => setMainTab('leaderboard')}
            className={`flex-1 py-2.5 rounded-lg text-sm transition-all ${
              mainTab === 'leaderboard'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
            style={{ fontWeight: 600 }}
          >
            <Trophy className="w-4 h-4 inline mr-1.5" />
            Ranking
          </button>
          <button
            onClick={() => setMainTab('feed')}
            className={`flex-1 py-2.5 rounded-lg text-sm transition-all ${
              mainTab === 'feed'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
            style={{ fontWeight: 600 }}
          >
            <Users className="w-4 h-4 inline mr-1.5" />
            Feed
          </button>
          <button
            onClick={() => setMainTab('resources')}
            className={`flex-1 py-2.5 rounded-lg text-sm transition-all ${
              mainTab === 'resources'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
            style={{ fontWeight: 600 }}
          >
            <BookOpen className="w-4 h-4 inline mr-1.5" />
            Learn
          </button>
          </div>
        </div>
      </div>

      {/* Feed Tab Content */}
      {mainTab === 'feed' && (
        <div className="px-6 py-6">
          {/* Feed Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {(['all', 'following', 'popular'] as FeedFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setFeedFilter(filter)}
                className={`px-4 py-2 rounded-full text-xs whitespace-nowrap transition-all ${
                  feedFilter === filter
                    ? 'bg-[#5B7FF3] text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
                style={{ fontWeight: 600 }}
              >
                {filter === 'all' && 'All Posts'}
                {filter === 'following' && 'Following'}
                {filter === 'popular' && (
                  <>
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    Popular
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Community Posts */}
          <div className="space-y-4">
            {filteredAndSortedPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* Post Header */}
                <div className="p-5 pb-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] flex items-center justify-center flex-shrink-0">
                      <span className="text-white" style={{ fontWeight: 600, fontSize: '14px' }}>
                        {post.user.initials}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-gray-900" style={{ fontWeight: 600, fontSize: '15px' }}>
                        {post.user.name}
                      </h4>
                      <p className="text-gray-500 text-xs mt-0.5">
                        Shared a lifestyle shift · {post.timestamp}
                      </p>
                    </div>
                    <button
                      onClick={() => handleBookmark(post.id)}
                      className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Bookmark
                        className={`w-5 h-5 ${
                          post.isBookmarked ? 'fill-[#5B7FF3] text-[#5B7FF3]' : 'text-gray-400'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Post Content */}
                  <h3 className="text-gray-900 mb-3" style={{ fontWeight: 600, fontSize: '17px' }}>
                    {post.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {post.content}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 rounded-full bg-blue-50 text-[#5B7FF3] text-xs"
                        style={{ fontWeight: 600 }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Post Actions */}
                <div className="border-t border-gray-100 px-5 py-3 flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-2 group"
                  >
                    <Heart
                      className={`w-5 h-5 transition-all ${
                        post.isLiked
                          ? 'fill-red-500 text-red-500'
                          : 'text-gray-400 group-hover:text-red-400'
                      }`}
                    />
                    <span className={`text-sm ${post.isLiked ? 'text-red-500' : 'text-gray-600'}`} style={{ fontWeight: 500 }}>
                      {post.likes}
                    </span>
                  </button>
                  <button 
                    onClick={() => setShowComments(showComments === post.id ? null : post.id)}
                    className="flex items-center gap-2 group"
                  >
                    <MessageCircle className={`w-5 h-5 transition-colors ${showComments === post.id ? 'text-[#5B7FF3]' : 'text-gray-400 group-hover:text-[#5B7FF3]'}`} />
                    <span className={`text-sm transition-colors ${showComments === post.id ? 'text-[#5B7FF3]' : 'text-gray-600 group-hover:text-[#5B7FF3]'}`} style={{ fontWeight: 500 }}>
                      {post.comments.length}
                    </span>
                  </button>
                  <button className="flex items-center gap-2 group ml-auto">
                    <Share2 className="w-5 h-5 text-gray-400 group-hover:text-[#5B7FF3] transition-colors" />
                  </button>
                </div>

                {/* Comments Section */}
                <AnimatePresence>
                  {showComments === post.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 bg-gray-50"
                    >
                      {/* Existing Comments */}
                      <div className="px-5 py-4 space-y-4">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs" style={{ fontWeight: 600 }}>
                                {comment.user.initials}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="bg-white rounded-2xl px-4 py-3 border border-gray-100">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>
                                    {comment.user.name}
                                  </span>
                                  <span className="text-gray-400 text-xs">·</span>
                                  <span className="text-gray-500 text-xs">{comment.timestamp}</span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                              </div>
                              <div className="flex items-center gap-4 mt-2 px-2">
                                <button
                                  onClick={() => handleCommentLike(post.id, comment.id)}
                                  className="flex items-center gap-1.5 group"
                                >
                                  <Heart
                                    className={`w-4 h-4 transition-all ${
                                      comment.isLiked
                                        ? 'fill-red-500 text-red-500'
                                        : 'text-gray-400 group-hover:text-red-400'
                                    }`}
                                  />
                                  {comment.likes > 0 && (
                                    <span className={`text-xs ${comment.isLiked ? 'text-red-500' : 'text-gray-500'}`}>
                                      {comment.likes}
                                    </span>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Add Comment Input */}
                        <div className="flex gap-3 pt-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs" style={{ fontWeight: 600 }}>YO</span>
                          </div>
                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddComment(post.id);
                                }
                              }}
                              placeholder="Write a comment..."
                              className="flex-1 px-4 py-2 rounded-full border border-gray-200 focus:border-[#5B7FF3] focus:outline-none text-sm"
                            />
                            <button
                              onClick={() => handleAddComment(post.id)}
                              disabled={!newComment.trim()}
                              className="w-9 h-9 rounded-full bg-[#5B7FF3] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#4a6fd9] transition-colors"
                            >
                              <Send className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredAndSortedPosts.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-900 mb-2" style={{ fontWeight: 600, fontSize: '17px' }}>
                No posts yet
              </h3>
              <p className="text-gray-500 text-sm">
                Be the first to share your progress!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Tab Content */}
      {mainTab === 'leaderboard' && (
        <div className="py-6">
          {/* Stats Header */}
          <div className="px-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-6 text-white shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm mb-1" style={{ fontWeight: 500 }}>Your Participation Score</p>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-8 h-8 text-white" />
                    <span className="text-4xl" style={{ fontWeight: 700 }}>
                      {leaderboard.find(u => u.isCurrentUser)?.participationScore || 0}
                    </span>
                    <span className="text-xl text-white/80 mt-2" style={{ fontWeight: 500 }}>pts</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Flame className="w-4 h-4 text-white/80" />
                    <span className="text-sm text-white/90">{leaderboard.find(u => u.isCurrentUser)?.streak || 0} day streak</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-2">
                    <span className="text-3xl" style={{ fontWeight: 700 }}>#{leaderboard.find(u => u.isCurrentUser)?.rank || 0}</span>
                  </div>
                  <p className="text-xs text-white/80" style={{ fontWeight: 500 }}>Your Rank</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/90">
                <Sparkles className="w-4 h-4" />
                <span>Logging, coaching chats & to-dos count! 🎉</span>
              </div>
            </motion.div>
          </div>

          {/* Leaderboard Title */}
          <div className="px-6 mb-4">
            <h2 className="text-gray-900 mb-1" style={{ fontSize: '22px', fontWeight: 700 }}>
              Monthly Leaderboard
            </h2>
            <p className="text-gray-600 text-sm mb-2">
              Ranked by daily logging streaks
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-gray-400">
              <span className="flex items-center gap-1" >
                <Flame className="w-3 h-3 text-orange-500" />
                Streaks (max 30 days)
              </span>
            </div>
          </div>

          {/* Leaderboard List */}
          <div className="px-6 space-y-3">
            {leaderboard.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-2xl border shadow-sm transition-all ${
                  user.isCurrentUser
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-[#5B7FF3] shadow-md scale-[1.02]'
                    : 'bg-white border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="p-4 flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0 w-10 flex items-center justify-center">
                    {user.rank === 1 && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md">
                        <Crown className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {user.rank === 2 && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-md">
                        <Medal className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {user.rank === 3 && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-md">
                        <Medal className="w-5 h-5 text-white" />
                      </div>
                    )}
                    {user.rank > 3 && (
                      <span className="text-gray-400 text-lg" style={{ fontWeight: 600 }}>
                        #{user.rank}
                      </span>
                    )}
                  </div>

                  {/* User Avatar */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    user.isCurrentUser
                      ? 'bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9]'
                      : 'bg-gradient-to-br from-purple-400 to-pink-400'
                  }`}>
                    <span className="text-white" style={{ fontWeight: 600, fontSize: '14px' }}>
                      {user.initials}
                    </span>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`text-sm truncate ${user.isCurrentUser ? 'text-[#5B7FF3]' : 'text-gray-900'}`} style={{ fontWeight: 600 }}>
                        {user.name}
                      </h3>
                      {user.isCurrentUser && (
                        <span className="px-2 py-0.5 rounded-full bg-[#5B7FF3] text-white text-xs" style={{ fontWeight: 600 }}>
                          You
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-0.5">
                        <Flame className="w-3 h-3 text-orange-500" />
                        {user.streak}d streak
                      </span>
                    </div>
                  </div>

                  {/* Participation Score */}
                  <div className="flex flex-col items-end gap-0.5">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-100">
                      <Trophy className="w-3.5 h-3.5 text-[#5B7FF3]" />
                      <span className="text-[#5B7FF3]" style={{ fontWeight: 700, fontSize: '16px' }}>
                        {user.participationScore}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400" style={{ fontWeight: 500 }}>points</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Motivation Footer */}
          <div className="px-6 mt-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-5 border border-blue-100"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B7FF3] to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 mb-1" style={{ fontWeight: 600, fontSize: '15px' }}>
                    How to Earn Points
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-2">
                    Climb the leaderboard by maintaining your daily logging streaks:
                  </p>
                  <ul className="text-gray-600 text-xs space-y-1">
                    <li>🔥 <strong>Daily logging streaks</strong> (10 pts per day, max 30 days)</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Resources Tab Content */}
      {mainTab === 'resources' && (
        <div className="py-6">
          {/* Resource Type Filters */}
          <div className="px-6 mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(['all', 'articles', 'podcasts', 'videos'] as ResourceType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setResourceType(type)}
                  className={`px-4 py-2 rounded-full text-xs whitespace-nowrap transition-all ${
                    resourceType === type
                      ? 'bg-[#5B7FF3] text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {type === 'all' && 'All'}
                  {type === 'articles' && (
                    <>
                      <BookOpen className="w-3 h-3 inline mr-1" />
                      Articles
                    </>
                  )}
                  {type === 'podcasts' && (
                    <>
                      <Headphones className="w-3 h-3 inline mr-1" />
                      Podcasts
                    </>
                  )}
                  {type === 'videos' && (
                    <>
                      <Video className="w-3 h-3 inline mr-1" />
                      Videos
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filters */}
          <div className="px-6 mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(['all', 'weight', 'glucose', 'fitness'] as ResourceCategory[]).map((category) => (
                <button
                  key={category}
                  onClick={() => setResourceCategory(category)}
                  className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all ${
                    resourceCategory === category
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'bg-gray-50 text-gray-600 border border-gray-100 hover:border-gray-200'
                  }`}
                  style={{ fontWeight: 600 }}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Resource Header */}
          <div className="px-6 mb-6">
            <h2 className="text-gray-900 mb-2" style={{ fontSize: '22px', fontWeight: 700 }}>
              Learn, listen, and watch to master your CGM
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Articles, podcasts, and videos curated by Olivia. Drop back anytime you need a quick refresher or a deep dive before chatting with your care team.
            </p>
          </div>

          {/* Resources Grid */}
          <div className="px-6 space-y-4">
            {filteredResources.map((resource) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleResourceClick(resource)}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  {/* Resource Icon */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    resource.type === 'article' ? 'bg-blue-50' :
                    resource.type === 'podcast' ? 'bg-purple-50' :
                    'bg-orange-50'
                  }`}>
                    {resource.type === 'article' && <BookOpen className="w-6 h-6 text-[#5B7FF3]" />}
                    {resource.type === 'podcast' && <Headphones className="w-6 h-6 text-purple-600" />}
                    {resource.type === 'video' && <Video className="w-6 h-6 text-orange-600" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title & Category */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {/* Resource Type Tag */}
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                            resource.type === 'article' ? 'bg-blue-50 text-blue-700' :
                            resource.type === 'podcast' ? 'bg-purple-50 text-purple-700' :
                            'bg-orange-50 text-orange-700'
                          }`} style={{ fontWeight: 600 }}>
                            {getResourceTypeIcon(resource.type)}
                            {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                          </span>
                        </div>
                        <h3 className="text-gray-900" style={{ fontWeight: 600, fontSize: '16px' }}>
                          {resource.title}
                        </h3>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#5B7FF3] transition-colors flex-shrink-0" />
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      {resource.description}
                    </p>

                    {/* Meta Info */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500" style={{ fontWeight: 500 }}>
                          {resource.duration}
                        </span>
                      </div>
                      {resource.author && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500" style={{ fontWeight: 500 }}>
                            {resource.author}
                          </span>
                        </>
                      )}
                      <span className="text-gray-300">•</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        resource.category === 'glucose' ? 'bg-blue-50 text-blue-700' :
                        resource.category === 'weight' ? 'bg-green-50 text-green-700' :
                        'bg-orange-50 text-orange-700'
                      }`} style={{ fontWeight: 600 }}>
                        {resource.category}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {resource.progress !== undefined && resource.progress > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#5B7FF3] transition-all"
                            style={{ width: `${resource.progress}%` }}
                          />
                        </div>
                        {resource.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <span className="text-xs text-gray-500" style={{ fontWeight: 500 }}>
                            {resource.progress}%
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Empty State */}
          {filteredResources.length === 0 && (
            <div className="text-center py-16 px-6">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-900 mb-2" style={{ fontWeight: 600, fontSize: '17px' }}>
                No resources found
              </h3>
              <p className="text-gray-500 text-sm">
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>
      )}

      {/* Floating Create Post Button (Feed only) */}
      {mainTab === 'feed' && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreatePost(true)}
          className="fixed right-6 w-14 h-14 bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] rounded-full shadow-lg flex items-center justify-center z-50"
          style={{ top: '75%' }}
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.button>
      )}

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreatePost(false)}
              className="fixed inset-0 bg-black/40 z-50"
            />

            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] z-50 max-h-[85vh] overflow-y-auto"
            >
              <div className="p-6 pb-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-gray-900" style={{ fontSize: '22px', fontWeight: 700 }}>
                    Share Your Win
                  </h2>
                  <button
                    onClick={() => setShowCreatePost(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] flex items-center justify-center">
                    <span className="text-white text-sm" style={{ fontWeight: 600 }}>YO</span>
                  </div>
                  <div>
                    <p className="text-gray-900" style={{ fontWeight: 600, fontSize: '15px' }}>You</p>
                    <p className="text-gray-500 text-xs">Sharing a lifestyle shift</p>
                  </div>
                </div>

                {/* Title Input */}
                <div className="mb-4">
                  <label className="text-sm text-gray-700 mb-2 block" style={{ fontWeight: 600 }}>
                    Title
                  </label>
                  <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="What did you accomplish?"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#5B7FF3] focus:outline-none text-sm"
                    style={{ fontWeight: 500 }}
                  />
                </div>

                {/* Content Input */}
                <div className="mb-4">
                  <label className="text-sm text-gray-700 mb-2 block" style={{ fontWeight: 600 }}>
                    Share your story
                  </label>
                  <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Tell the community about your win and what worked for you..."
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#5B7FF3] focus:outline-none resize-none text-sm leading-relaxed"
                  />
                </div>

                {/* Tags Selection */}
                <div className="mb-6">
                  <label className="text-sm text-gray-700 mb-3 block" style={{ fontWeight: 600 }}>
                    Add tags (optional)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.slice(0, 9).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-[#5B7FF3] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        style={{ fontWeight: 600 }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  onClick={handleCreatePost}
                  className="w-full py-3.5 bg-gradient-to-br from-[#5B7FF3] to-[#7B9FF9] text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                  style={{ fontWeight: 600, fontSize: '15px' }}
                >
                  Share with Community
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
