import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SearchBar from '../SearchBar'

describe('SearchBar Component', () => {
  it('menampilkan input pencarian', () => {
    render(<SearchBar onSearch={() => {}} />)

    expect(
      screen.getByPlaceholderText(/cari item berdasarkan nama atau deskripsi/i)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cari/i })).toBeInTheDocument()
  })

  it('memanggil onSearch saat form disubmit', () => {
    const handleSearch = vi.fn()

    render(<SearchBar onSearch={handleSearch} />)

    fireEvent.change(
      screen.getByPlaceholderText(/cari item berdasarkan nama atau deskripsi/i),
      { target: { value: 'laptop' } }
    )
    fireEvent.click(screen.getByRole('button', { name: /cari/i }))

    expect(handleSearch).toHaveBeenCalledWith('laptop')
  })

  it('mengosongkan input saat tombol clear diklik', () => {
    const handleSearch = vi.fn()

    render(<SearchBar onSearch={handleSearch} />)

    const input = screen.getByPlaceholderText(
      /cari item berdasarkan nama atau deskripsi/i
    )
    fireEvent.change(input, { target: { value: 'monitor' } })

    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /clear/i }))

    expect(input).toHaveValue('')
    expect(handleSearch).toHaveBeenCalledWith('')
  })
})
