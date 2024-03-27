import { cache } from "./cache"

const GH_URL = 'https://api.github.com/users'

/**
 * Retrieve all profiles
 * @returns 
 */
export const getProfiles = async (payload = []) => {
    payload = payload.map((c) => c.toLowerCase())

    let contributors
    const cached = await cache.get('contributors')

    if (cached) {
        console.log('***Using Cache***')
        return cached
    } else {
        const fetchUser = async (username) => {
            const res = await fetch(`${GH_URL}/${username}`, { next: { revalidate: 3600 } })
            if (!res.ok) {
                throw new Error(`Failed to fetch GitHub user: ${username}`)
            }
            return await res.json()
        }

        contributors = await Promise.all(payload.map(async (username) => {
            try {
                const user = await fetchUser(username)
                return {
                    id: user.id,
                    name: user.login.toLowerCase(),
                    avatar: user.avatar_url,
                    profile: user.html_url,
                    contributions: user.contributions,
                }
            } catch (error) {
                console.error(error.message)
                return null
            }
        }))
    }


    const parse = contributors.filter(contributor => contributor !== null)
    await cache.set('contributors', parse)
    return parse
}

