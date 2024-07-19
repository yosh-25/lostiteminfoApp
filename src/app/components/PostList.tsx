'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient, Session } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useAuth from '../useAuth';

const PostList = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        const { data: posts, error } = await supabase
        .from('post')
        .select('*')
        .eq('hidden', false) // hiddenがfalseのレコードのみ取得
        .order('find_date', { ascending: false }); // find_dateで降順に並び替え;
        if (error) {
          console.error('Error fetching posts:', error);
        } else {
          setPosts(posts || []);
          setFilteredPosts(posts);
        }
      }
    };

    getSession();
  }, [supabase]);

  useAuth();

  const navigateToDetail = (postId: string) => {
    router.push(`/post/${postId}`);
  };

  useEffect(() => {
    const searchQueryLower = searchQuery.toLowerCase();
    const filtered = posts.filter(post => {
      const dateMatch = new Date(post.find_date).toLocaleDateString().includes(searchQueryLower);
      const resolvedMatch = (searchQueryLower === '済' && post.resolved === true) ||
                            (searchQueryLower === '未' && post.resolved === false);
      return post.lostitem_name.toLowerCase().includes(searchQueryLower) || dateMatch || resolvedMatch;
    });
    setFilteredPosts(filtered);
  }, [searchQuery, posts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `発見日：${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
      <div className="border-b-2 border-gray-200 pb-4 mb-6">
        <input
          type="text"
          placeholder="キーワードを入力してください"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full p-3 border border-gray-300 rounded"
        />
      </div>
      <div className="flex flex-col space-y-4">
        {filteredPosts.map((post) => (
          <div key={post.id} className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full">
                {post.resolved ? (
                  <Image src="/img/true.png" alt="Resolved" width={50} height={50} className="rounded-full" />
                ) : (
                  <Image src="/img/false.png" alt="Unresolved" width={50} height={50} className="rounded-full" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{post.lostitem_name}</h2>
                <p className="text-gray-700">{formatDate(post.find_date)}</p>
              </div>
            </div>
            <button
              onClick={() => navigateToDetail(post.id)}
              className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-700"
            >
              詳細
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PostList;