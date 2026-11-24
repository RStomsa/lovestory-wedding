import { redirect } from 'next/navigation';

interface Props {
  params: Promise<{ category: string }>;
}

export default async function CategoryTemplatesPage({ params }: Props) {
  const { category } = await params;
  
  // Mapping Vietnamese route names to category keys
  let targetCategory = 'wedding';
  if (category === 'thiep-cuoi' || category === 'dam-cuoi' || category === 'wedding') {
    targetCategory = 'wedding';
  } else if (category === 'sinh-nhat' || category === 'birthday') {
    targetCategory = 'birthday';
  } else if (category === 'tot-nghiep' || category === 'graduation') {
    targetCategory = 'graduation';
  } else if (category === 'su-kien' || category === 'event') {
    targetCategory = 'event';
  } else if (category === 'ky-niem' || category === 'anniversary') {
    targetCategory = 'anniversary';
  }

  // Redirect to /templates with the category filter
  redirect(`/templates?category=${targetCategory}`);
}
