import React from 'react'

/**
 * Off-screen spam honeypot. Sighted users and screen-reader users never reach
 * it (hidden, aria-hidden, tabIndex -1, autocomplete off); bots that fill every
 * field will. The server rejects any submission where `website` is non-empty.
 * Spread a react-hook-form register() onto it: `<Honeypot {...register('website')} />`.
 */
export function Honeypot(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px] h-0 w-0 overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" tabIndex={-1} autoComplete="off" {...props} />
      </label>
    </div>
  )
}
