import React from 'react'

/**
 * A third-party JotForm embedded as a plain iframe, deliberately WITHOUT
 * JotForm's embed-handler script.
 *
 * That script's only real job is auto-resizing the frame to the form's height.
 * It isn't worth loading third-party JavaScript onto a page that otherwise
 * ships none: the script runs in our origin and sees our visitors. A fixed
 * height plus internal scrolling costs one scrollbar and keeps the page
 * script-free. If the scrolling ever becomes the bigger annoyance, swapping in
 * the official script is a contained change to this file.
 *
 * Applicant data never touches our server or database. The form posts straight
 * from the iframe to JotForm over HTTPS, which is what we want, since this
 * application asks for Social Security numbers. Nothing here is wired to
 * /api/leads on purpose.
 */
export function JotFormEmbed({
  formId,
  title,
  className = '',
}: {
  formId: string
  title: string
  className?: string
}) {
  const src = `https://form.jotform.com/${formId}`

  return (
    <div className={className}>
      <div className="overflow-hidden rounded-[10px] border border-chalk bg-white">
        <iframe
          src={src}
          title={title}
          // Lazy so the financing page's own content paints first; the form is
          // below the fold on every viewport we support.
          loading="lazy"
          // Height is viewport-relative rather than a tall fixed pixel value so
          // the frame always fits on screen. That keeps exactly one thing
          // scrolling at a time: you scroll the page to bring the form into
          // view, then scroll the form. A frame taller than the viewport makes
          // the two scroll contexts fight, which is worse on a form this long.
          className="block h-[85vh] min-h-[560px] w-full border-0"
        />
      </div>
      <p className="mt-3 font-inter text-xs text-iron">
        Trouble with the form above?{' '}
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-orange-ink hover:underline"
        >
          Open it in a new tab
        </a>
        .
      </p>
    </div>
  )
}
