import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ItemForm from '../ItemForm'

describe('ItemForm Component', () => {
  it('menampilkan form tambah item', () => {
    render(<ItemForm onSubmit={() => {}} loading={false} />)

    expect(screen.getByText(/tambah item baru/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /tambah item/i })).toBeInTheDocument()
  })

  it('menampilkan validasi saat nama kosong', async () => {
    const handleSubmit = vi.fn()

    render(<ItemForm onSubmit={handleSubmit} loading={false} />)

    fireEvent.change(screen.getByPlaceholderText(/contoh: laptop/i), {
      target: { value: '   ' },
    })
    fireEvent.change(screen.getByPlaceholderText(/contoh: 15000000/i), {
      target: { value: '1000' },
    })
    fireEvent.click(screen.getByRole('button', { name: /tambah item/i }))

    expect(await screen.findByText(/nama item wajib diisi/i)).toBeInTheDocument()
    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('menampilkan validasi saat harga tidak valid', async () => {
    const handleSubmit = vi.fn()

    render(<ItemForm onSubmit={handleSubmit} loading={false} />)

    fireEvent.change(screen.getByPlaceholderText(/contoh: laptop/i), {
      target: { value: 'Laptop' },
    })
    fireEvent.change(screen.getByPlaceholderText(/contoh: 15000000/i), {
      target: { value: '0' },
    })
    fireEvent.click(screen.getByRole('button', { name: /tambah item/i }))

    expect(await screen.findByText(/harga harus lebih dari 0/i)).toBeInTheDocument()
    expect(handleSubmit).not.toHaveBeenCalled()
  })

  it('mengirim data item yang sudah dibersihkan saat submit berhasil', async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined)

    render(<ItemForm onSubmit={handleSubmit} loading={false} />)

    fireEvent.change(screen.getByPlaceholderText(/contoh: laptop/i), {
      target: { value: '  Laptop Pro  ' },
    })
    fireEvent.change(screen.getByPlaceholderText(/opsional/i), {
      target: { value: '  Untuk kerja  ' },
    })
    fireEvent.change(screen.getByPlaceholderText(/contoh: 15000000/i), {
      target: { value: '15000000' },
    })
    fireEvent.change(screen.getByDisplayValue('0'), {
      target: { value: '3' },
    })
    fireEvent.click(screen.getByRole('button', { name: /tambah item/i }))

    await waitFor(() => expect(handleSubmit).toHaveBeenCalledTimes(1))
    expect(handleSubmit).toHaveBeenCalledWith(
      {
        name: 'Laptop Pro',
        description: 'Untuk kerja',
        price: 15000000,
        quantity: 3,
      },
      undefined
    )
    expect(screen.getByPlaceholderText(/contoh: laptop/i)).toHaveValue('')
  })
})
