import { useState } from "react";
import { Lock, Eye, EyeOff, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const BANK_PASSWORD = "krispi123";

const encryptNumber = (number: string) => {
  return number.split('').map(char => {
    const code = char.charCodeAt(0);
    return String.fromCharCode(code + 3);
  }).join('');
};

const decryptNumber = (encrypted: string) => {
  return encrypted.split('').map(char => {
    const code = char.charCodeAt(0);
    return String.fromCharCode(code - 3);
  }).join('');
};

const ENCRYPTED_ACCOUNT_NUMBER = encryptNumber("8420697954");
const BANK_NAME = "BCA";
const ACCOUNT_HOLDER = "Ajeng Andhika";

export default function BankInfo() {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const handleUnlock = () => {
    if (password === BANK_PASSWORD) {
      setIsUnlocked(true);
      toast({
        title: "Berhasil!",
        description: "Informasi rekening ditampilkan",
      });
    } else {
      toast({
        title: "Password Salah",
        description: "Silakan coba lagi",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  return (
    <section className="py-16 md:py-24" data-testid="bank-info-section">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Informasi Transfer
          </h2>
          <p className="text-lg text-muted-foreground">
            Untuk pembayaran via transfer bank
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-primary/10 rounded-lg">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Rekening Bank</CardTitle>
            </div>
            <CardDescription>
              Masukkan password untuk melihat nomor rekening
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isUnlocked ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Masukkan password"
                      className="pr-10"
                      data-testid="input-bank-password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={handleUnlock}
                  className="w-full"
                  data-testid="button-unlock"
                >
                  <Lock className="mr-2 h-4 w-4" />
                  Buka Informasi
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Hubungi kami untuk mendapatkan password
                </p>
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Bank</p>
                    <p className="text-lg font-semibold" data-testid="text-bank-name">
                      {BANK_NAME}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nomor Rekening</p>
                    <p className="text-2xl font-bold text-primary" data-testid="text-account-number">
                      {decryptNumber(ENCRYPTED_ACCOUNT_NUMBER)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Atas Nama</p>
                    <p className="text-lg font-semibold" data-testid="text-account-holder">
                      {ACCOUNT_HOLDER}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={() => {
                    setIsUnlocked(false);
                    setPassword("");
                  }}
                  className="w-full"
                  data-testid="button-lock"
                >
                  Sembunyikan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
