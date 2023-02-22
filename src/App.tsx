import {Component, createSignal, onMount, For} from 'solid-js';

import styles from './App.module.css';
import {supabase} from './supabaseClient';

const TABLE_NAME = 'books';

type BookType = {
    id: string;
    name: string;
    author: string;
};

const App: Component = () => {
    const [name, setName] = createSignal('');
    const [author, setAuthor] = createSignal('');
    // 함수이기 때문에 함수 표현식으로 접근 해주어야함.
    // 컴포넌트 밖에서도 사용이 가능함 -> 더 유연함.
    const [books, setBooks] = createSignal<BookType[]>([]); // 초기값은 empty array이다.
    const [editBook, setEditBook] = createSignal<BookType>({
        id: '',
        name: '',
        author: '',
    });
    const fetchBooks = async () => {
        const {data, error} = await supabase
            .from(TABLE_NAME)
            .select('*')
            .order('created_at', {ascending: false});

        if (error) {
            console.log(error);
        }

        if (data) {
            setBooks(data);
        }
    };

    const onSave = async () => {
        if (!name().length || !author().length) {
            return;
        }

        try {
            const {data} = await supabase
                .from(TABLE_NAME)
                .insert({
                    name: name(),
                    author: author(),
                })
                .select()
                .single();

            if (data) {
                setBooks((prev) => [data, ...prev]);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setName('');
            setAuthor('');
        }
    };

    const onDelete = async (id) => {
        try {
            await supabase
                .from(TABLE_NAME)
                .delete()
                .match({id: id})
                .then(() => {
                    fetchBooks();
                });
        } catch (e) {
            console.log(e);
        }
    };

    const onUpdate = async () => {
        try {
            await supabase
                .from(TABLE_NAME)
                .update({
                    name: editBook().name,
                    author: editBook().author,
                })
                .eq('id', editBook().id);
        } catch (e) {}
    };

    onMount(() => {
        //익명 함수를 받고 한번만 호출한다.
        fetchBooks();
    });
    return (
        <div class={styles.App}>
            <h2>독서목록</h2>
            <hr />
            <div>
                <input
                    type='text'
                    placeholder='name'
                    value={name()}
                    onChange={(e) => setName(e.currentTarget.value)}
                />
                <input
                    type='text'
                    placeholder='author'
                    value={author()}
                    onChange={(e) => setAuthor(e.currentTarget.value)}
                />
                <button onClick={onSave}>추가</button>
            </div>
            <For each={books()}>
                {(book) => (
                    <div>
                        <input
                            type='text'
                            value={book.name}
                            onChange={(e) =>
                                setEditBook({
                                    ...book,
                                    name: e.currentTarget.value,
                                })
                            }
                        />
                        <input
                            type='text'
                            value={book.author}
                            onChange={(e) =>
                                setEditBook({
                                    ...book,
                                    author: e.currentTarget.value,
                                })
                            }
                        />
                        <button onClick={onUpdate}>Update</button>
                        <button onClick={() => onDelete(book.id)}>
                            Delete
                        </button>
                    </div>
                )}
            </For>
        </div>
    );
};

export default App;
