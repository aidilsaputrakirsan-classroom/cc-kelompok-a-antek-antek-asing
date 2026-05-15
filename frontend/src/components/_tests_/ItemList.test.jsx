import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ItemList from '../ItemList'

vi.mock('../ItemCard', () => ({
  default: ({ item, onEdit, onDelete, isDeleting }) => (
    <div data-testid={`item-card-${item.id}`}>
      <span>{item.name}</span>
      <button onClick={() => onEdit(item)}>Edit</button>
      <button onClick={() => onDelete(item.id)}>Hapus</button>
      {isDeleting && <span>Deleting</span>}
    </div>
  ),
}))

describe('ItemList Component', () => {
  it('menampilkan loading state', () => {
    render(
      <ItemList
        items={[]}
        onEdit={() => {}}
        onDelete={() => {}}
        loading
        deletingItemId={null}
      />
    )

    expect(screen.getByText(/memuat data/i)).toBeInTheDocument()
  })

  it('menampilkan empty state saat item kosong', () => {
    render(
      <ItemList
        items={[]}
        onEdit={() => {}}
        onDelete={() => {}}
        loading={false}
        deletingItemId={null}
      />
    )

    expect(screen.getByText(/belum ada item/i)).toBeInTheDocument()
    expect(
      screen.getByText(/gunakan form di atas untuk menambahkan item pertama/i)
    ).toBeInTheDocument()
  })

  it('merender daftar item dan meneruskan aksi edit/hapus', () => {
    const handleEdit = vi.fn()
    const handleDelete = vi.fn()
    const items = [
      { id: 1, name: 'Laptop', price: 15000000, quantity: 5 },
      { id: 2, name: 'Mouse', price: 250000, quantity: 10 },
    ]

    render(
      <ItemList
        items={items}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loading={false}
        deletingItemId={2}
      />
    )

    expect(screen.getByText('Laptop')).toBeInTheDocument()
    expect(screen.getByText('Mouse')).toBeInTheDocument()
    expect(screen.getByText('Deleting')).toBeInTheDocument()

    fireEvent.click(screen.getAllByText('Edit')[0])
    fireEvent.click(screen.getAllByText('Hapus')[1])

    expect(handleEdit).toHaveBeenCalledWith(items[0])
    expect(handleDelete).toHaveBeenCalledWith(2)
  })
})
