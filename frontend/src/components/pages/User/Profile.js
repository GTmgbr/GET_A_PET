import api from '../../../utils/api'
import { useState, useEffect } from 'react'

import styles from './Profile.module.css'
import formStyles from '../../form/Form.module.css'

import Input from '../../form/Input'
import useFlashMessage from '../../../hooks/useFlashMessage'
import RoundedImage from '../../layout/RoundedImage'

function Profile() {
    const [user, setUser] = useState({})
    const [preview, setPreview] = useState(null)
    const [token] = useState(localStorage.getItem('token') || '')
    const { setFlashMessage } = useFlashMessage()

    useEffect(() => {
        api.get('/users/checkuser', {
            headers: {
                Authorization: `Bearer ${JSON.parse(token)}`,
            },
        }).then((response) => {
            setUser(response.data)
        })
    }, [token])

    function onFileChange(e) {
        const file = e.target.files[0]
        if (file) {
            setPreview(file)
        }
    }

    function handleChange(e) {
        setUser({ ...user, [e.target.name]: e.target.value })
    }

    async function handleSubmit(e) {
        e.preventDefault()

        let msgType = 'success'

        const formData = new FormData()

        formData.append('name', user.name)
        formData.append('email', user.email)
        formData.append('phone', user.phone)

        if (user.password) {
            formData.append('password', user.password)
            formData.append('confirmpassword', user.confirmpassword)
        }

        if (preview) {
            formData.append('image', preview)
        }

        const data = await api.patch(`/users/edit/${user._id}`, formData, {
            headers: {
                Authorization: `Bearer ${JSON.parse(token)}`,
                'Content-Type': 'multipart/form-data',
            },
        }).then((response) => {
            return response.data
        }).catch((err) => {
            msgType = 'error'
            return err.response?.data || { message: 'Erro ao atualizar' }
        })

        if (data.user) {
            setUser(data.user)
        }

        setFlashMessage(data.message, msgType)
    }

    return (
        <section>
            <div className={styles.profile_header}>
                <h1>Perfil</h1>

                {(preview || user?.image) && (
                    <RoundedImage
                        src={
                            preview
                                ? URL.createObjectURL(preview)
                                : `${process.env.REACT_APP_API}/images/users/${user.image}`
                        }
                        alt={user.name}
                    />
                )}
            </div>

            <form
                onSubmit={handleSubmit}
                className={formStyles.form_container}
                encType="multipart/form-data"
            >
                <Input
                    text="Imagem"
                    type="file"
                    name="image"
                    handleOnChange={onFileChange}
                />

                <Input
                    text="E-mail"
                    type="email"
                    name="email"
                    placeholder="Digite o seu email"
                    handleOnChange={handleChange}
                    value={user.email || ''}
                />

                <Input
                    text="Nome"
                    type="text"
                    name="name"
                    placeholder="Digite o seu nome"
                    handleOnChange={handleChange}
                    value={user.name || ''}
                />

                <Input
                    text="Telefone"
                    type="text"
                    name="phone"
                    placeholder="Digite o seu telefone"
                    handleOnChange={handleChange}
                    value={user.phone || ''}
                />

                <Input
                    text="Senha"
                    type="password"
                    name="password"
                    placeholder="Digite a sua senha"
                    handleOnChange={handleChange}
                />

                <Input
                    text="Confirmação de senha"
                    type="password"
                    name="confirmpassword"
                    placeholder="Confirme a sua senha"
                    handleOnChange={handleChange}
                />

                <input type="submit" value="Editar" />
            </form>
        </section>
    )
}

export default Profile