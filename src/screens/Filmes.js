import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import TextInput from '../TextInput.js';
import Text from '../Text.js';
import { useSettings } from '../settings.jsx';
import { font, card, H2, GridRow, Chip } from '../ui.jsx';

const GENRES = ['Todos', 'Sci-Fi', 'Épico', 'Neo-Noir', 'Drama', 'Ação', 'Terror'];

function Stars({ rating, interactive, onSelect }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => {
        const active = star <= rating;
        return (
          <Pressable key={star} disabled={!interactive} onPress={() => onSelect && onSelect(star)}>
            <Text style={{ fontSize: interactive ? 22 : 17, color: active ? '#ffd700' : 'rgba(255,255,255,0.2)' }}>★</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function FieldInput(props) {
  return (
    <TextInput
      placeholderTextColor="rgba(255,255,255,.4)"
      style={{ backgroundColor: 'rgba(0,0,0,.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,.15)', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, color: '#fff', fontSize: 14 }}
      {...props}
    />
  );
}

export default function Filmes() {
  const st = useSettings();
  const { palette } = st;

  const [movies, setMovies] = useState(st.movies || []);
  const [filterGenre, setFilterGenre] = useState('Todos');
  const [sortBy, setSortBy] = useState('rating');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newInfo, setNewInfo] = useState('');
  const [newGenre, setNewGenre] = useState('Sci-Fi');
  const [newRating, setNewRating] = useState(5);
  const [newReview, setNewReview] = useState('');

  const handleAddMovie = () => {
    if (!newTitle.trim()) return;
    const newMovie = { id: Date.now(), title: newTitle.trim(), info: newInfo.trim() || '2026', genre: newGenre, rating: Number(newRating), date: new Date().toISOString().slice(0, 10), review: newReview.trim() };
    const updated = [newMovie, ...movies];
    setMovies(updated);
    st.set({ movies: updated });
    setNewTitle(''); setNewInfo(''); setNewReview(''); setShowAddForm(false);
  };

  const handleDeleteMovie = id => {
    const updated = movies.filter(m => m.id !== id);
    setMovies(updated);
    st.set({ movies: updated });
  };

  const filteredMovies = movies.filter(m => filterGenre === 'Todos' || m.genre.includes(filterGenre));
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'recent') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    return 0;
  });

  const avgRating = movies.length ? (movies.reduce((acc, m) => acc + m.rating, 0) / movies.length).toFixed(1) : '0.0';
  const topMovie = [...movies].sort((a, b) => b.rating - a.rating)[0];

  return (
    <View style={{ gap: 24 }}>
      <View style={{ ...card, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <View style={{ gap: 4 }}>
          <H2>Diário de Cinema & Ranking</H2>
          <Text style={{ fontSize: 13.5, opacity: 0.6, color: '#fff' }}>Registre filmes assistidos, atribua notas e mantenha suas resenhas organizadas.</Text>
        </View>
        <Pressable onPress={() => setShowAddForm(v => !v)}>
          <Text style={{ color: '#fff', fontFamily: font.body, fontSize: 16, fontWeight: '700' }}>{showAddForm ? '✕ Fechar Formulário' : '+ Adicionar Filme'}</Text>
        </Pressable>
      </View>

      {/* indicadores lado a lado */}
      <GridRow min={150} gap={10} cols={2}>
        <View style={{ ...card, gap: 6 }}>
          <Text style={{ fontSize: 12, opacity: 0.5, textTransform: 'uppercase', color: '#fff' }}>Filmes Assistidos</Text>
          <Text style={{ fontSize: 26, fontWeight: '700', color: palette.acLite }}>{movies.length}</Text>
        </View>
        <View style={{ ...card, gap: 6 }}>
          <Text style={{ fontSize: 12, opacity: 0.5, textTransform: 'uppercase', color: '#fff' }}>Média de Avaliação</Text>
          <Text style={{ fontSize: 26, fontWeight: '700', color: '#ffd700' }}>{avgRating} ★</Text>
        </View>
        <View style={{ ...card, gap: 6 }}>
          <Text style={{ fontSize: 12, opacity: 0.5, textTransform: 'uppercase', color: '#fff' }}>Melhor Rankeado</Text>
          <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>{topMovie ? topMovie.title : 'Nenhum'}</Text>
        </View>
      </GridRow>

      {showAddForm && (
        <View style={{ ...card, gap: 16, borderWidth: 1, borderColor: palette.ac2Alpha(0.35) }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: palette.acLite }}>Registrar Novo Filme</Text>
          <GridRow min={200} gap={14} cols={1}>
            <View>
              <Text style={{ fontSize: 12, opacity: 0.6, marginBottom: 5, color: '#fff' }}>Título do Filme</Text>
              <FieldInput placeholder="Ex: Blade Runner 2049" value={newTitle} onChangeText={setNewTitle} />
            </View>
            <View>
              <Text style={{ fontSize: 12, opacity: 0.6, marginBottom: 5, color: '#fff' }}>Diretor / Ano</Text>
              <FieldInput placeholder="Ex: Denis Villeneuve · 2017" value={newInfo} onChangeText={setNewInfo} />
            </View>
          </GridRow>
          <View>
            <Text style={{ fontSize: 12, opacity: 0.6, marginBottom: 8, color: '#fff' }}>Gênero</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {GENRES.filter(g => g !== 'Todos').map(g => <Chip key={g} on={newGenre === g} onPress={() => setNewGenre(g)}>{g}</Chip>)}
            </View>
          </View>
          <View>
            <Text style={{ fontSize: 12, opacity: 0.6, marginBottom: 6, color: '#fff' }}>Sua Avaliação (Estrelas)</Text>
            <Stars rating={newRating} interactive onSelect={setNewRating} />
          </View>
          <View>
            <Text style={{ fontSize: 12, opacity: 0.6, marginBottom: 5, color: '#fff' }}>Sua Opinião / Resenha</Text>
            <FieldInput multiline placeholder="Escreva sua opinião, destaques de atuação, roteiro..." value={newReview} onChangeText={setNewReview} style={{ minHeight: 75, textAlignVertical: 'top' }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
            <Pressable onPress={() => setShowAddForm(false)}><Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 13.5 }}>Cancelar</Text></Pressable>
            <Pressable onPress={handleAddMovie} style={{ backgroundColor: palette.acDeep, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16 }}>
              <Text style={{ color: '#fff', fontSize: 13.5, fontWeight: '700' }}>+ Salvar Filme</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {GENRES.map(g => <Chip key={g} on={filterGenre === g} onPress={() => setFilterGenre(g)}>{g}</Chip>)}
      </View>

      <View style={{ gap: 14 }}>
        {sortedMovies.length === 0 ? (
          <View style={{ ...card, alignItems: 'center', padding: 30, opacity: 0.5 }}>
            <Text style={{ color: '#fff', fontSize: 14 }}>Nenhum filme registrado nesta categoria.</Text>
          </View>
        ) : sortedMovies.map((movie, index) => {
          const isTopRanked = sortBy === 'rating' && index === 0;
          return (
            <View key={movie.id} style={{ ...card, gap: 12, borderWidth: 1, borderColor: isTopRanked ? 'rgba(255, 215, 0, 0.4)' : 'rgba(255, 255, 255, 0.08)' }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <Text style={{ fontFamily: font.display, fontSize: 18, fontWeight: '700', color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : 'rgba(255,255,255,0.4)' }}>#{index + 1}</Text>
                  <View>
                    <Text style={{ fontSize: 17, fontWeight: '700', color: '#fff' }}>{movie.title}</Text>
                    <Text style={{ fontSize: 12.5, opacity: 0.55, color: '#fff' }}>{movie.info}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <Text style={{ backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, fontSize: 12, opacity: 0.8, color: '#fff' }}>{movie.genre}</Text>
                  <Stars rating={movie.rating} />
                  <Pressable onPress={() => handleDeleteMovie(movie.id)}><Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 15 }}>✕</Text></Pressable>
                </View>
              </View>
              {!!movie.review && (
                <View style={{ backgroundColor: 'rgba(0,0,0,0.25)', padding: 10, borderRadius: 10, borderLeftWidth: 3, borderLeftColor: palette.acM2 }}>
                  <Text style={{ fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.85)' }}>"{movie.review}"</Text>
                </View>
              )}
              <Text style={{ fontSize: 11.5, opacity: 0.4, alignSelf: 'flex-end', color: '#fff' }}>Assistido em: {movie.date}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
