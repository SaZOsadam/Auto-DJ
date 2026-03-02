export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <div className="space-y-6 text-gray-300 leading-relaxed">
        <section>
          <h2 className="text-xl font-semibold text-white mb-2">Overview</h2>
          <p>
            AutoDJ is a client-side web application that helps you manage automatic Spotify playlist rotation.
            Your privacy is important to us. This policy explains what data AutoDJ collects and how it is used.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">Data We Collect</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            <li><strong className="text-gray-300">Playlist IDs and names</strong> — stored locally in your browser to manage rotation.</li>
            <li><strong className="text-gray-300">Rotation settings</strong> — your preferred rotation mode and interval, stored locally.</li>
            <li><strong className="text-gray-300">Play statistics</strong> — counts of playlist and song plays, stored locally in your browser.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">Data Storage</h2>
          <p>
            All data is currently stored in your browser's <strong className="text-white">localStorage</strong>.
            No data is sent to any external server. Your data stays on your device and is not shared with anyone.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">Third-Party Services</h2>
          <p>
            AutoDJ uses the <strong className="text-white">Spotify Embed Player</strong> (IFrame API) to play music.
            When you use the embedded player, Spotify's own privacy policy applies to that interaction.
            AutoDJ does not access your Spotify account credentials.
          </p>
          <p className="mt-2">
            <a href="https://www.spotify.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline">
              Spotify Privacy Policy
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">Cookies</h2>
          <p>
            AutoDJ itself does not use cookies. However, the embedded Spotify player may set its own cookies
            as part of Spotify's service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">Future Updates</h2>
          <p>
            We may introduce user accounts (Google/email sign-in) and cloud storage in the future.
            If we do, this policy will be updated to reflect how your data is handled.
            You will be notified of any significant changes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">Contact</h2>
          <p>
            If you have questions about this privacy policy, please reach out via the
            <a href="https://github.com/SaZOsadam/Auto-DJ" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 underline ml-1">
              AutoDJ GitHub repository
            </a>.
          </p>
        </section>

        <div className="pt-4 border-t border-gray-700">
          <p className="text-gray-500 text-sm">Last updated: March 2026</p>
        </div>
      </div>
    </div>
  )
}
