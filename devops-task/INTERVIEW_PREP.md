# 🎯 Mülakat Hazırlık Kartı — DevOps Task

## Terraform Soruları

**S: Neden Terraform? CloudFormation neden değil?**
> "Terraform multi-cloud, provider-agnostic bir araç. Aynı kodu Azure veya GCP'ye taşıyabilirim.
> CloudFormation AWS'e özgü. Ayrıca Terraform HCL daha okunabilir ve modüler yapısı güçlü."

**S: Terraform state dosyasını nerede sakladınız?**
> "Bu görevde lokalde sakladım, ama üretimde S3 + DynamoDB backend kullanırım.
> S3 versiyonlama ile state geçmişi, DynamoDB ile distributed lock — iki kişi aynı anda
> terraform apply yapamaz. Bu race condition'ı önler."

**S: `terraform plan` ile `terraform apply` farkı nedir?**
> "Plan, değiştirilecek kaynakları preview olarak gösterir, hiçbir şey değiştirmez.
> Apply ise planı uygular. CI/CD'de önce plan çalıştırıp review ettikten sonra apply yaparız."

**S: EC2 user_data nedir?**
> "Instance ilk boot olduğunda bir kez çalışan bash scripti. Ben Docker, Docker Compose,
> AWS CLI ve Nginx'i buraya kurdum. Böylece EC2 hazır gelir, GitHub Actions sadece deploy eder."

---

## Docker & ECR Soruları

**S: Multi-stage build neden kullandınız?**
> "İlk stage'de build araçları (npm, gcc vb.) var — büyük image. İkinci stage'e sadece
> çalışma zamanı için gereken dosyaları kopyalıyorum. Bu sayede frontend image'ı ~50MB,
> build stage ise ~600MB olurdu. Güvenlik yüzeyi ve deploy süresi küçülür."

**S: ECR vs Docker Hub neden ECR seçtiniz?**
> "Görev ECR gerektirdi, ama mantıksal gerekçesi: EC2 IAM Role ile şifresiz pull yapılabilir,
> private registry ücretsiz (500MB), VPC içinde kalınca transfer daha hızlı ve güvenli."

**S: DB container'ı için ECR kullanmadınız, neden?**
> "Resmi `postgres:16-alpine` image'ı zaten üretim kalitesinde ve güvenli. Üzerine hiçbir
> custom katman eklemedim. ECR'ye push etmek gereksiz kompleksite ekler, downstream da
> Docker Hub'dan zaten çekebilir."

---

## GitHub Actions Soruları

**S: Workflow'da 3 job var, neden ayrı ayrı?**
> "Separation of concerns ve paralel çalışabilirlik. Test başarısız olursa build çalışmaz —
> gereksiz build maliyeti önlenir. Her job ayrı runner'da, loglar temiz ayrışır."

**S: Secrets'ı nasıl yönetiyorsunuz?**
> "GitHub Repository Secrets'ta. Workflow loglarında `***` olarak maskelenir. .env dosyasını
> repoya commit etmiyorum, Actions runtime'da EC2'ye yazıyorum ve chmod 600 yapıyorum."

**S: Zero-downtime deployment nasıl sağlıyorsunuz?**
> "`docker-compose up -d --remove-orphans` komutu container'ları tek tek yeniler.
> Nginx `systemctl reload` ile (restart değil) aktif bağlantıları kesmeden config yeniler."

---

## Nginx Soruları

**S: Nginx neden reverse proxy olarak kullanıldı?**
> "Birkaç avantaj: (1) SSL termination tek noktada yapılır. (2) Container portları dışarıya
> açılmaz — güvenlik. (3) Yük dengeleme eklenebilir. (4) Static file serving optimize.
> (5) Rate limiting, gzip, caching — tüm bunlar uygulama koduna dokunmadan yapılır."

**S: 'Sadece frontend'e erişim' gereksinimini nasıl uyguladınız?**
> "Security Group'ta sadece 80 ve 443 portunu açtım. Docker Compose'da BE ve DB için
> `expose` kullandım (host'a bind etmedi), `ports` değil. Nginx de sadece frontend'i proxy'liyor."

**S: nginx -t ne işe yarar?**
> "Konfigürasyon dosyasını syntax açısından test eder, Nginx'i yeniden başlatmadan.
> CI/CD'de deploy öncesi bu kontrolü yaparım — hatalı config deploy edilmez."

---

## Genel Mimari Soruları

**S: Bu mimarinin zayıf noktaları nelerdir?**
> "Single point of failure: EC2 düşerse her şey durur. Üretimde Auto Scaling Group + Load
> Balancer kullanırım. DB için RDS (managed, automated backup). Ama bu görevi free tier'da
> tamamlamak için single EC2 yeterliydi."

**S: Nasıl scale edersiniz?**
> "Horizontal: EC2 instance sayısını artırıp ALB arkasına koyarım. Vertical: instance type'ı
> büyütürüm (t2.micro → t3.medium). DB için read replica eklerim. Uzun vadede ECS/EKS'e geçerim."

**S: Monitoring nasıl yaparsınız?**
> "CloudWatch ile EC2 metrics (CPU, RAM). Docker stats için cAdvisor. Uygulama logları için
> CloudWatch Logs Agent veya Loki + Grafana. Alert için SNS → email/Slack."
