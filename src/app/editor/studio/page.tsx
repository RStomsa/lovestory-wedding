import React from 'react';
import StudioEditor from '@/components/editor/studio/StudioEditor';

export const metadata = {
  title: 'Soạn Thiệp Cưới Online — LoveStory Studio',
  description: 'Thiết kế thiệp cưới online cao cấp, scrollytelling và hiệu ứng sống động.',
};

export default function StudioEditorPage() {
  return (
    <div className="h-[100dvh] w-full overflow-hidden">
      <StudioEditor mode="user" />
    </div>
  );
}
