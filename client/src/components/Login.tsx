import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';

const Login: React.FC = () => {
  // username/password input value ကို controlled component အဖြစ် state နဲ့ချိတ်ထားတယ်
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // login fail ဖြစ်ချိန် UI alert ပြဖို့ error state
  const [error, setError] = useState('');
  // submit လုပ်နေချိန် button/input disable ဖို့ loading state
  const [isLoading, setIsLoading] = useState(false);

  // AuthContext ထဲက login function ကိုယူပြီး auth API flow နဲ့ချိတ်တယ်
  const { login } = useAuth();
  // login success ပြီး route ပြောင်းဖို့ react-router navigate hook
  const navigate = useNavigate();

  // form submit event နဲ့ချိတ်ထားတဲ့ handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // browser default form submit reload ကိုတား
    setError(''); // submit မတိုင်ခင် error အဟောင်းကိုရှင်း
    setIsLoading(true); // submit စတင်ချိန် loading on

    try {
      await login(username, password); // AuthContext.login -> backend login API
      navigate('/'); // success ဖြစ်ရင် home route သို့ပြောင်း
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed'); // error message ကို state ထဲထည့်
    } finally {
      setIsLoading(false); // success/fail မရွေး loading off
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full px-4 relative overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/logigif.mp4"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-white/70" />
      <Card className="relative z-10 w-full max-w-sm sm:max-w-md">
        <CardHeader>
          <CardTitle>LOGIN</CardTitle>
          <CardDescription>
            Enter your credentials to access the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* onSubmit -> handleSubmit ချိတ်ထားတဲ့ login form */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)} // input change -> username state update
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} // input change -> password state update
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                {/* error state ရှိမှသာ alert render */}
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Demo Accounts:</h3>
            <div className="text-xs text-gray-600 space-y-1">
              <div><strong>Admin:</strong> admin / admin123</div>
              <div><strong>Operation:</strong> operation / op123</div>
              <div><strong>Finance:</strong> finance / fin123</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
