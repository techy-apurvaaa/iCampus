import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function Logo({ dark = false }) {
  return (
    <Link className={`logo ${dark ? 'logo-dark' : ''}`} to="/">
      <span className="logo-mark">
        <GraduationCap color="#ffffff" />
      </span>

      <span>
        <b>CPIP</b>
        <small>CAMPUS REPOSITORY</small>
      </span>
    </Link>
  );
}