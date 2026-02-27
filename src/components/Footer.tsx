const Footer = () => (
  <footer className="w-full py-6 px-6 bg-background border-t border-muted text-center text-muted-foreground flex flex-col gap-2 items-center">
  <span className="font-medium">&copy; {new Date().getFullYear()} MindPulse. All rights reserved.</span>
    <div className="flex gap-4 text-sm">
      <a href="https://github.com/" target="_blank" rel="noopener" className="hover:text-primary">GitHub</a>
      <a href="/about" className="hover:text-primary">About</a>
      <a href="mailto:support@forumfeelings.com" className="hover:text-primary">Contact</a>
    </div>
    <div className="flex gap-2 pt-2">
  <img src="/pulse.svg" alt="Logo" className="w-6 h-6" />
      <span className="text-xs">Made for mental health awareness</span>
    </div>
  </footer>
);

export default Footer;
