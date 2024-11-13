"use client"

import React, { useState, useEffect } from 'react'
import { Button, CircularProgress, Grid, TextField, InputAdornment, IconButton } from '@mui/material'
import { FaPencilAlt, FaEye, FaEyeSlash } from "react-icons/fa"
import axios from 'axios'
import Swal from 'sweetalert2'

export default function EnhancedProfileEditor() {
  const [userData, setUserData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    status: 'A',
    roleId: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  })

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    phone: '',
  })

  useEffect(() => {
    checkLoginStatus()
  }, [])

  const checkLoginStatus = () => {
    const token = localStorage.getItem('jwtToken')
    const userId = localStorage.getItem('userId')

    if (token && userId) {
      setIsLoggedIn(true)
      fetchUserData(userId)
    } else {
      setIsLoggedIn(false)
      setLoading(false)
      setError('No has iniciado sesión. Por favor, inicia sesión para ver tu perfil.')
    }
  }

  const fetchUserData = async (userId) => {
    setLoading(true)
    try {
      const response = await axios.get(`http://localhost:1056/api/users/${userId}`)
      setUserData(response.data)
      setError('')
    } catch (err) {
      setError('Error al cargar los datos del perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setUserData(prev => ({
      ...prev,
      [name]: value
    }))
    handleValidation(name, value)
  }

  const handlePasswordChange = (e) => {
    setPassword(e.target.value)
    handleValidation('password', e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (Object.values(errors).some(error => error !== '')) {
      Swal.fire({
        title: '¡Advertencia!',
        text: 'Por favor, corrija los errores en el formulario',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      })
      return
    }
    
    setLoading(true)
    try {
      const dataToUpdate = { ...userData }
      if (password) {
        dataToUpdate.password = password
      }
      await axios.put(`http://localhost:1056/api/users/${userData.id}`, dataToUpdate)
      Swal.fire({
        title: '¡Éxito!',
        text: 'Perfil actualizado exitosamente',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      })
      if (password) {
        setPassword('')
        setShowPassword(false)
      }
    } catch (err) {
      Swal.fire({
        title: '¡Error!',
        text: 'Error al actualizar el perfil',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      })
    } finally {
      setLoading(false)
    }
  }

  const validateName = (value) => {
    const regex = /^[A-Za-z\s]+$/
    return regex.test(value) ? '' : 'El nombre solo debe contener letras'
  }

  const validateEmail = (value) => {
    const regex = /^\S+@\S+\.\S+$/
    return regex.test(value) ? '' : 'El correo no es válido'
  }

  const validatePassword = (value) => {
    if (value === '') return ''
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    return regex.test(value) ? '' : 'La contraseña debe tener al menos 8 caracteres, incluyendo letras y números'
  }

  const validatePhone = (value) => {
    const regex = /^\d{10}$/
    return regex.test(value) ? '' : 'El teléfono debe contener 10 números'
  }

  const handleValidation = (name, value) => {
    let error = ''
    switch (name) {
      case 'name':
        error = validateName(value)
        break
      case 'email':
        error = validateEmail(value)
        break
      case 'password':
        error = validatePassword(value)
        break
      case 'phone':
        error = validatePhone(value)
        break
      default:
        break
    }
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleBlur = (e) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    handleValidation(name, e.target.value)
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircularProgress />
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center mt-8">
        <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="right-content w-100">
      <div className="row d-flex align-items-center w-100">
        <div className="spacing d-flex align-items-center">
          <div className='col-sm-12'>
            <span className='Title'>Ver mi perfil</span>
          </div>
        </div>
        <div className='card shadow border-0 p-4'>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="name"
                  name="name"
                  label="Nombre"
                  value={userData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={userData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && !!errors.email}
                  helperText={touched.email && errors.email}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="phone"
                  name="phone"
                  label="Teléfono"
                  value={userData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.phone && !!errors.phone}
                  helperText={touched.phone && errors.phone}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Contraseña (dejar en blanco para no cambiar)"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handleBlur}
                  error={touched.password && !!errors.password}
                  helperText={touched.password && errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={togglePasswordVisibility}
                          edge="end"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            <div className="flex justify-center mt-6">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                startIcon={<FaPencilAlt />}
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}