import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Prismic from '@prismicio/client';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { useRouter } from 'next/router';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();
  if (router.isFallback) {
    return <div>Carregando...</div>;
  }
  const timeReading = post.data.content.map(item => {
    return Math.ceil(item.body.text.split(' ').length / 200);
  });
  return (
    <>
      <div
        style={{
          backgroundImage: `url(${post.data.banner.url})`,
          width: '100%',
          height: '400px',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      />

      <div className={commonStyles.Container}>
        <div className={styles.Header}>
          <h1>{post.data.title}</h1>
          <div>
            <div>
              <FiCalendar />
              {post.first_publication_date}
            </div>
            <div>
              <FiUser />
              {post.data.author}
            </div>
            <div>
              <FiClock />
              {timeReading} min
            </div>
          </div>
        </div>
        {post.data.content.map(item => (
          <div className={styles.Content}>
            <h1>{item.heading}</h1>
            <div
              className={`${styles.postContent} ${styles.postContentPreview}`}
              dangerouslySetInnerHTML={{ __html: item.body.text }}
            />
          </div>
        ))}
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: [],
      pageSize: 100,
    }
  );
  return {
    paths: posts.results.map(post => `/post/${post.uid}`) || [],
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { params } = context;
  const { slug } = params;
  const prismic = getPrismicClient();
  const response: Post = await prismic.getByUID('post', String(slug), {});

  const post: Post = {
    first_publication_date: format(
      new Date(response.first_publication_date),
      'PP',
      { locale: ptBR }
    ),
    data: {
      author: response.data.author,
      title: response.data.title,
      banner: {
        url: String(response.data.banner.url),
      },
      content: response.data.content.map(data => {
        return {
          body: {
            text: RichText.asHtml(data.body),
          },
          heading: String(data.heading),
        };
      }),
    },
  };

  return { props: { post } };
};
