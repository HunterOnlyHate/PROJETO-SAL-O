import React from 'react';
import { getPublicProducts } from '@/actions/dataActions';
import { ProdutosListClient } from '@/components/products/ProdutosListClient';

export const revalidate = 60; // revalida a cada 60s ou via revalidatePath

export default async function ProdutosPage() {
    const products = await getPublicProducts();
    return <ProdutosListClient initialProducts={products} />;
}
