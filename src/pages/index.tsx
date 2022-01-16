import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<PostPagination>(postsPagination);
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function handleLoadPosts(next_page: RequestInfo) {
    fetch(next_page)
      .then(res => res.json())
      .then((res: PostPagination) => {
        setPosts({
          ...res,
          results: [
            ...posts.results,
            ...res.results.map((post: Post) => {
              return {
                ...post,
                first_publication_date: format(
                  new Date(post.first_publication_date),
                  'PP',
                  { locale: ptBR }
                ),
              };
            }),
          ],
        });
      });
  }
  return (
    <div className={commonStyles.Container}>
      {posts.results.map(post => (
        <div key={post.uid} className={styles.Content}>
          <Link href={`post/${post.uid}`}>
            <a>
              <h1>{post.data.title}</h1>
              <span>{post.data.subtitle}</span>
              <div>
                <div>
                  <FiCalendar /> <time>{post.first_publication_date}</time>
                </div>
                <div>
                  <FiUser /> {post.data.author}
                </div>
              </div>
            </a>
          </Link>
        </div>
      ))}
      {posts.next_page && (
        <button
          className={styles.Button}
          type="button"
          onClick={() => handleLoadPosts(postsPagination.next_page)}
        >
          Carregar mais posts
        </button>
      )}
    </div>
  );
}
export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const response: PostPagination = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author', 'post.next_page'],
      pageSize: 1,
      page: 1,
    }
  );

  const postsPagination: PostPagination = {
    next_page: response.next_page,
    results: response.results.map((post: Post) => {
      return {
        ...post,
        first_publication_date: format(
          new Date(post.first_publication_date),
          'PP',
          { locale: ptBR }
        ),
      };
    }),
  };

  return {
    props: { postsPagination },
  };
};
// export const getStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);
//   // TODO
// };
