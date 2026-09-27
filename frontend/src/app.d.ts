// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			/** Admin session actor resolved server-side (null when logged out). */
			actor: {
				id: number
				email: string
				name: string
				role: 'admin' | 'marketing' | 'sales' | 'noc'
			} | null
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
