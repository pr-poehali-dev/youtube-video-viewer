import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

type Video = {
  id: string;
  title: string;
  channel: string;
  views: string;
  duration: string;
  thumbnail: string;
  category: string;
};

type Playlist = {
  id: string;
  name: string;
  videos: string[];
};

const mockVideos: Video[] = [
  { id: '1', title: 'Введение в React Hooks', channel: 'CodeMaster', views: '1.2M', duration: '15:30', thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', category: 'Технологии' },
  { id: '2', title: 'Красивые пейзажи 4K', channel: 'Nature TV', views: '850K', duration: '22:45', thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', category: 'Путешествия' },
  { id: '3', title: 'Готовим пасту карбонара', channel: 'Кухня Шефа', views: '2.1M', duration: '12:15', thumbnail: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400', category: 'Еда' },
  { id: '4', title: 'Топ 10 гаджетов 2024', channel: 'TechReview', views: '3.5M', duration: '18:20', thumbnail: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', category: 'Технологии' },
  { id: '5', title: 'Йога для начинающих', channel: 'HealthyLife', views: '680K', duration: '25:00', thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', category: 'Спорт' },
  { id: '6', title: 'История искусства', channel: 'Art Channel', views: '450K', duration: '35:10', thumbnail: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400', category: 'Образование' },
  { id: '7', title: 'Обзор Tesla Model 3', channel: 'AutoPro', views: '1.8M', duration: '20:30', thumbnail: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400', category: 'Авто' },
  { id: '8', title: 'Медитация на закате', channel: 'MindfulSpace', views: '920K', duration: '30:00', thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400', category: 'Релакс' },
];

const categories = ['Все', 'Технологии', 'Путешествия', 'Еда', 'Спорт', 'Образование', 'Авто', 'Релакс'];

export default function Index() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([
    { id: '1', name: 'Избранное', videos: [] },
    { id: '2', name: 'Смотреть позже', videos: [] }
  ]);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const { toast } = useToast();

  const filteredVideos = mockVideos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.channel.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFavorite = (videoId: string) => {
    setFavorites(prev => 
      prev.includes(videoId) ? prev.filter(id => id !== videoId) : [...prev, videoId]
    );
    toast({
      title: favorites.includes(videoId) ? 'Удалено из избранного' : 'Добавлено в избранное',
      duration: 2000,
    });
  };

  const addToPlaylist = (playlistId: string, videoId: string) => {
    setPlaylists(prev => prev.map(pl => 
      pl.id === playlistId ? { ...pl, videos: [...pl.videos, videoId] } : pl
    ));
    toast({
      title: 'Видео добавлено в плейлист',
      duration: 2000,
    });
  };

  const createPlaylist = () => {
    if (newPlaylistName.trim()) {
      const newPlaylist: Playlist = {
        id: Date.now().toString(),
        name: newPlaylistName,
        videos: []
      };
      setPlaylists([...playlists, newPlaylist]);
      setNewPlaylistName('');
      toast({
        title: 'Плейлист создан',
        duration: 2000,
      });
    }
  };

  const VideoCard = ({ video }: { video: Video }) => (
    <Card className="group overflow-hidden hover-lift cursor-pointer bg-card/50 backdrop-blur border-border/50">
      <div className="relative">
        <img 
          src={video.thumbnail} 
          alt={video.title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <Badge className="absolute bottom-2 right-2 bg-black/80 text-white border-0">
          {video.duration}
        </Badge>
      </div>
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        <p className="text-sm text-muted-foreground">{video.channel}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Icon name="Eye" size={14} />
            {video.views}
          </span>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleFavorite(video.id)}
              className={favorites.includes(video.id) ? 'text-red-500' : ''}
            >
              <Icon name={favorites.includes(video.id) ? 'Heart' : 'Heart'} size={16} fill={favorites.includes(video.id) ? 'currentColor' : 'none'} />
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Icon name="ListPlus" size={16} />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Добавить в плейлист</DialogTitle>
                </DialogHeader>
                <div className="space-y-2">
                  {playlists.map(playlist => (
                    <Button
                      key={playlist.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => addToPlaylist(playlist.id, video.id)}
                    >
                      <Icon name="List" size={16} className="mr-2" />
                      {playlist.name} ({playlist.videos.length})
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                <Icon name="Play" size={24} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gradient">VideoHub</h1>
            </div>
            
            <div className="flex-1 max-w-2xl mx-8">
              <div className="relative">
                <Icon name="Search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск видео..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-border/50 focus:border-primary"
                />
              </div>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button className="gradient-primary border-0">
                  <Icon name="Plus" size={20} className="mr-2" />
                  Плейлист
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card">
                <DialogHeader>
                  <DialogTitle>Создать новый плейлист</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Название плейлиста"
                    value={newPlaylistName}
                    onChange={(e) => setNewPlaylistName(e.target.value)}
                  />
                  <Button onClick={createPlaylist} className="w-full gradient-primary border-0">
                    Создать
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="home" className="space-y-8">
          <TabsList className="bg-muted/50 p-1 w-full justify-start overflow-x-auto">
            <TabsTrigger value="home" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              <Icon name="Home" size={18} className="mr-2" />
              Главная
            </TabsTrigger>
            <TabsTrigger value="popular" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              <Icon name="TrendingUp" size={18} className="mr-2" />
              Популярное
            </TabsTrigger>
            <TabsTrigger value="favorites" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              <Icon name="Heart" size={18} className="mr-2" />
              Избранное
            </TabsTrigger>
            <TabsTrigger value="playlists" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
              <Icon name="List" size={18} className="mr-2" />
              Плейлисты
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className={selectedCategory === category ? 'gradient-primary border-0' : ''}
                >
                  {category}
                </Button>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="popular" className="space-y-6">
            <h2 className="text-3xl font-bold">Популярное сегодня</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...mockVideos].sort((a, b) => parseFloat(b.views) - parseFloat(a.views)).map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-6">
            <h2 className="text-3xl font-bold">Избранное</h2>
            {favorites.length === 0 ? (
              <div className="text-center py-20">
                <Icon name="Heart" size={64} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-xl text-muted-foreground">Добавьте видео в избранное</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mockVideos.filter(v => favorites.includes(v.id)).map(video => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="playlists" className="space-y-6">
            <h2 className="text-3xl font-bold">Мои плейлисты</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlists.map(playlist => (
                <Card key={playlist.id} className="p-6 bg-card/50 backdrop-blur hover-lift cursor-pointer border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 gradient-accent rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon name="List" size={32} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{playlist.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {playlist.videos.length} {playlist.videos.length === 1 ? 'видео' : 'видео'}
                      </p>
                    </div>
                  </div>
                  {playlist.videos.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {playlist.videos.slice(0, 3).map(videoId => {
                        const video = mockVideos.find(v => v.id === videoId);
                        return video ? (
                          <div key={videoId} className="text-sm text-muted-foreground flex items-center gap-2">
                            <Icon name="Play" size={14} />
                            {video.title}
                          </div>
                        ) : null;
                      })}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
