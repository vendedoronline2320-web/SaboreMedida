
import React, { useState, useEffect } from 'react';
import { VideoLesson } from '../types';
import { Play, Clock, ArrowLeft, Heart, FileText, Share2, Loader2, Tag, ChevronRight } from 'lucide-react';
import { db } from '../services/database';
import { storage } from '../services/storage';

interface VideoLessonsViewProps {
  videos: VideoLesson[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  externalSelection?: string;
  onSelectionHandled?: () => void;
}

const VideoLessonsView: React.FC<VideoLessonsViewProps> = ({ videos, favorites, onToggleFavorite, externalSelection, onSelectionHandled }) => {
  const [selectedVideo, setSelectedVideo] = useState<VideoLesson | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);

  useEffect(() => {
    if (externalSelection) {
      const found = videos.find(v => v.id === externalSelection);
      if (found) {
        handleSelect(found);
      }
      onSelectionHandled?.();
    }
  }, [externalSelection, videos]);

  const handleSelect = async (video: VideoLesson) => {
    db.addToHistory('video', video.id, video.title);
    setSelectedVideo(video);
    setLoadingVideo(true);

    if (video.videoUrl.startsWith('local_storage:')) {
      const fileId = video.videoUrl.split(':')[1];
      const url = await storage.getFileUrl(fileId);
      setActiveVideoUrl(url);
    } else {
      setActiveVideoUrl(video.videoUrl);
    }
    setLoadingVideo(false);
  };

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('v=')) {
        videoId = url.split('v=')[1].split('&')[0];
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
      } else {
        videoId = url.split('/').pop() || '';
      }
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    } else if (url.includes('vimeo.com')) {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    return null;
  };

  const renderPlayer = () => {
    if (loadingVideo) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white gap-4">
          <Loader2 className="animate-spin" size={48} />
          <p className="font-black uppercase tracking-widest text-[10px]">Iniciando aula...</p>
        </div>
      );
    }

    if (!activeVideoUrl) return null;

    const embedUrl = getEmbedUrl(activeVideoUrl);
    if (embedUrl) {
      return (
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
    } else {
      return (
        <video
          key={activeVideoUrl}
          src={activeVideoUrl}
          controls
          autoPlay
          className="w-full h-full object-contain bg-black"
          controlsList="nodownload"
        />
      );
    }
  };

  const renderMarkdown = (text: string) => {
    if (!text) return <p className="text-gray-400 italic">Nenhum conteúdo adicional registrado.</p>;
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) {
        return <h2 key={i} className="text-2xl font-black text-gray-900 dark:text-white mt-8 mb-4 border-b pb-2 border-gray-100 dark:border-slate-700">{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={i} className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-6 mb-3">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={i} className="ml-5 mb-2 text-gray-700 dark:text-gray-300 list-disc">{line.replace('- ', '')}</li>;
      }
      if (line.trim() === '') return <div key={i} className="h-4" />;
      return <p key={i} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed font-medium">{line}</p>;
    });
  };

  if (selectedVideo) {
    return (
      <div className="animate-fade-in max-w-5xl mx-auto pb-24">
        <button
          onClick={() => {
            setSelectedVideo(null);
            setActiveVideoUrl(null);
          }}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 mb-8 font-bold transition-all px-2"
        >
          <ArrowLeft size={20} /> Voltar para Biblioteca
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-[40px] md:rounded-[56px] shadow-2xl overflow-hidden border border-gray-50 dark:border-slate-700 mb-10 transition-colors">
          <div className="aspect-video bg-black relative shadow-2xl">
            {renderPlayer()}
          </div>
          <div className="p-8 md:p-14">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
              <div className="space-y-4 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-4 py-1.5 rounded-full">{selectedVideo.category || 'Premium'}</span>
                  <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Publicado em {new Date(selectedVideo.createdAt).toLocaleDateString()}</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">{selectedVideo.title}</h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium italic">{selectedVideo.shortDescription}</p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => onToggleFavorite(selectedVideo.id)}
                  className={`flex-grow md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-black transition-all ${favorites.includes(selectedVideo.id)
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 border border-red-100 dark:border-transparent shadow-xl shadow-red-100/50 dark:shadow-none'
                      : 'bg-gray-50 dark:bg-slate-700 text-gray-400 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 border border-transparent'
                    }`}
                >
                  <Heart size={20} className={favorites.includes(selectedVideo.id) ? "fill-current" : ""} />
                  {favorites.includes(selectedVideo.id) ? 'Favoritado' : 'Salvar Aula'}
                </button>
                <button className="p-4 bg-gray-50 dark:bg-slate-700 text-gray-400 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-2xl transition-all border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/50">
                  <Share2 size={22} />
                </button>
              </div>
            </div>

            <div className="bg-gray-50/50 dark:bg-slate-700/30 p-8 md:p-14 rounded-[48px] border border-gray-100 dark:border-slate-600 relative overflow-hidden transition-colors">
              <div className="absolute top-0 right-0 p-10 opacity-5 dark:opacity-10 text-gray-900 dark:text-white">
                <FileText size={120} />
              </div>
              <h3 className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-emerald-900/40">
                  <FileText size={20} />
                </div>
                Guia Completo & Receita
              </h3>
              <div className="relative z-10">
                {renderMarkdown(selectedVideo.description)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-24">
      <div className="mb-14">
        <h3 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 transition-colors">Biblioteca de Aulas</h3>
        <p className="text-lg text-gray-400 dark:text-gray-500 font-medium transition-colors">Domine a cozinha saudável com nossas aulas passo a passo.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {videos.map((video) => (
          <div
            key={video.id}
            onClick={() => handleSelect(video)}
            className="group bg-white dark:bg-slate-800 rounded-[44px] shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
          >
            <div className="relative aspect-video overflow-hidden">
              <img src={video.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={video.title} />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md border border-white/40 rounded-full flex items-center justify-center text-white shadow-2xl scale-75 group-hover:scale-100 transition-all duration-300">
                  <Play className="fill-current ml-1" size={24} />
                </div>
              </div>
              <div className="absolute top-5 left-5">
                <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">{video.category || 'Premium'}</span>
              </div>
              <div className="absolute bottom-5 right-5 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-white tracking-widest border border-white/10">
                {video.duration}
              </div>
            </div>
            <div className="p-8 md:p-10">
              <div className="flex justify-between items-start gap-4 mb-3">
                <h4 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 leading-tight">{video.title}</h4>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(video.id);
                  }}
                  className={`p-2.5 rounded-xl transition-all ${favorites.includes(video.id) ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-300 dark:text-gray-600 hover:text-red-400 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                >
                  <Heart size={22} className={favorites.includes(video.id) ? "fill-current" : ""} />
                </button>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-6 line-clamp-2 italic leading-relaxed">{video.shortDescription}</p>
              <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-slate-700 transition-colors">
                <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                  <Clock size={16} /> {video.duration}
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 font-black text-sm flex items-center gap-2 group-hover:gap-3 transition-all">
                  Assistir Aula <ChevronRight size={18} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoLessonsView;
