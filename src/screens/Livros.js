import React, { useState, useEffect } from 'react';
import { View, Pressable, Platform } from 'react-native';
import TextInput from '../TextInput.js';
import Text from '../Text.js';
import { useSettings } from '../settings.jsx';
import { api } from '../api.js';
import { font, card, H2, GridRow, Chip } from '../ui.jsx';

const GENRES = ['Todos', 'Psicologia & Filosofia', 'Literatura', 'Ocultismo & Esoterismo', 'Tecnologia & Ciência', 'Poesia', 'Biografia'];

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

function FieldInput({ palette, ...props }) {
  return (
    <TextInput
      placeholderTextColor="rgba(255,255,255,.4)"
      style={{
        backgroundColor: 'rgba(0,0,0,.4)', borderWidth: 1, borderColor: 'rgba(255,255,255,.15)',
        borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, color: '#fff', fontSize: 14
      }}
      {...props}
    />
  );
}

export default function Livros() {
  const st = useSettings();
  const { palette } = st;

  const [books, setBooks] = useState(st.books || []);
  const [filterGenre, setFilterGenre] = useState('Todos');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newGenre, setNewGenre] = useState(GENRES[1]);
  const [newRating, setNewRating] = useState(5);
  const [newReview, setNewReview] = useState('');

  useEffect(() => {
    api.get('/v1/books')
      .then(data => { if (Array.isArray(data) && data.length > 0) { setBooks(data); st.set({ books: data }); } })
      .catch(() => {});
  }, []);

  const handleAddBook = () => {
    if (!newTitle.trim()) return;
    const newBook = {
      id: `book-${Date.now()}`,
      title: newTitle.trim(),
      author: newAuthor.trim() || 'Autor Desconhecido',
      genre: newGenre,
      rating: Number(newRating),
      date: new Date().toISOString().slice(0, 10),
      review: newReview.trim()
    };
    const updated = [newBook, ...books];
    setBooks(updated);
    st.set({ books: updated });
    api.post('/v1/books', newBook).catch(() => {});
    setNewTitle(''); setNewAuthor(''); setNewReview(''); setShowAddForm(false);
  };

  const handleDeleteBook = id => {
    const updated = books.filter(b => b.id !== id);
    setBooks(updated);
    st.set({ books: updated });
    api.del(`/v1/books/${id}`).catch(() => {});
  };

  const filteredBooks = books.filter(b => filterGenre === 'Todos' || b.genre.includes(filterGenre));
  const sortedBooks = [...filteredBooks].sort((a, b) => b.rating - a.rating);
  const avgRating = books.length ? (books.reduce((acc, b) => acc + (b.rating || 5), 0) / books.length).toFixed(1) : '0.0';
  const topBook = [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0))[0];

  return (
    <View style={{ gap: 24 }}>
      <View style={{ ...card, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <View style={{ gap: 4 }}>
          <H2>Biblioteca Pessoal & Acervo</H2>
          <Text style={{ fontSize: 13.5, opacity: 0.6, color: '#fff' }}>Organize suas leituras, avalie obras e registre impressões.</Text>
        </View>
        <Pressable onPress={() => setShowAddForm(v => !v)}>
          <Text style={{ color: '#fff', fontFamily: font.body, fontSize: 16, fontWeight: '700' }}>
            {showAddForm ? '✕ Fechar Formulário' : '+ Adicionar Livro'}
          </Text>
        </Pressable>
      </View>

      {/* indicadores lado a lado */}
      <GridRow min={150} gap={10} cols={2}>
        <View style={{ ...card, gap: 6 }}>
          <Text style={{ fontSize: 12, opacity: 0.5, textTransform: 'uppercase', color: '#fff' }}>Obras Cadastradas</Text>
          <Text style={{ fontSize: 26, fontWeight: '700', color: palette.acLite }}>{books.length}</Text>
        </View>
        <View style={{ ...card, gap: 6 }}>
          <Text style={{ fontSize: 12, opacity: 0.5, textTransform: 'uppercase', color: '#fff' }}>Média de Avaliação</Text>
          <Text style={{ fontSize: 26, fontWeight: '700', color: '#ffd700' }}>{avgRating} ★</Text>
        </View>
        <View style={{ ...card, gap: 6 }}>
          <Text style={{ fontSize: 12, opacity: 0.5, textTransform: 'uppercase', color: '#fff' }}>Melhor Avaliado</Text>
          <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>{topBook ? topBook.title : 'Nenhum'}</Text>
        </View>
      </GridRow>

      {showAddForm && (
        <View style={{ ...card, gap: 16, borderWidth: 1, borderColor: palette.ac2Alpha(0.35) }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: palette.acLite }}>Cadastrar Novo Livro</Text>
          <GridRow min={200} gap={14} cols={1}>
            <View>
              <Text style={{ fontSize: 12, opacity: 0.6, marginBottom: 5, color: '#fff' }}>Título do Livro</Text>
              <FieldInput palette={palette} placeholder="Ex: O Homem e Seus Símbolos" value={newTitle} onChangeText={setNewTitle} />
            </View>
            <View>
              <Text style={{ fontSize: 12, opacity: 0.6, marginBottom: 5, color: '#fff' }}>Autor</Text>
              <FieldInput palette={palette} placeholder="Ex: Carl G. Jung" value={newAuthor} onChangeText={setNewAuthor} />
            </View>
          </GridRow>
          <View>
            <Text style={{ fontSize: 12, opacity: 0.6, marginBottom: 8, color: '#fff' }}>Gênero</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {GENRES.filter(g => g !== 'Todos').map(g => (
                <Chip key={g} on={newGenre === g} onPress={() => setNewGenre(g)}>{g}</Chip>
              ))}
            </View>
          </View>
          <View>
            <Text style={{ fontSize: 12, opacity: 0.6, marginBottom: 6, color: '#fff' }}>Sua Avaliação</Text>
            <Stars rating={newRating} interactive onSelect={setNewRating} />
          </View>
          <View>
            <Text style={{ fontSize: 12, opacity: 0.6, marginBottom: 5, color: '#fff' }}>Resenha / Anotações</Text>
            <FieldInput palette={palette} multiline placeholder="Escreva suas anotações, principais citações..." value={newReview} onChangeText={setNewReview} style={{ minHeight: 75, textAlignVertical: 'top' }} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
            <Pressable onPress={() => setShowAddForm(false)}><Text style={{ color: 'rgba(255,255,255,.6)', fontSize: 13.5 }}>Cancelar</Text></Pressable>
            <Pressable onPress={handleAddBook} style={{ backgroundColor: palette.acDeep, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 16 }}>
              <Text style={{ color: '#fff', fontSize: 13.5, fontWeight: '700' }}>+ Salvar Livro</Text>
            </Pressable>
          </View>
        </View>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {GENRES.map(g => <Chip key={g} on={filterGenre === g} onPress={() => setFilterGenre(g)}>{g}</Chip>)}
      </View>

      <GridRow min={280} cols={1}>
        {sortedBooks.length === 0 ? (
          <View style={{ ...card, alignItems: 'center', padding: 30, opacity: 0.5 }}>
            <Text style={{ color: '#fff', fontSize: 14 }}>Nenhum livro encontrado nesta categoria.</Text>
          </View>
        ) : sortedBooks.map(book => (
          <View key={book.id} style={{ ...card, justifyContent: 'space-between', gap: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
            <View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: palette.acLite, backgroundColor: 'rgba(255,255,255,0.06)', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 6 }}>{book.genre}</Text>
                <Stars rating={book.rating} />
              </View>
              <Text style={{ fontFamily: font.display, fontSize: 19, fontWeight: '700', color: '#fff' }}>{book.title}</Text>
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', fontWeight: '500', marginTop: 2 }}>por {book.author}</Text>
              {!!book.review && (
                <View style={{ marginTop: 10, padding: 10, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.25)', borderLeftWidth: 3, borderLeftColor: palette.acM2 }}>
                  <Text style={{ fontSize: 13.5, lineHeight: 19, color: 'rgba(255,255,255,0.85)' }}>"{book.review}"</Text>
                </View>
              )}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)' }}>
              <Text style={{ fontSize: 12, opacity: 0.45, color: '#fff' }}>{book.date}</Text>
              <Pressable onPress={() => handleDeleteBook(book.id)}>
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Remover</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </GridRow>
    </View>
  );
}
