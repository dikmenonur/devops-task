# 🚀 DevOps Task — AWS CI/CD Pipeline

Terraform + GitHub Actions + Docker + ECR + EC2 + Nginx ile tam otomatik CI/CD hattı.

## 📐 Mimari

```
┌─────────────────────────────────────────────────────────┐
│                     GitHub Repository                    │
│                                                          │
│  push to main → GitHub Actions Workflow tetiklenir       │
└────────────────────┬────────────────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │   GitHub Actions     │
          │  ┌───────────────┐  │
          │  │  1. Test       │  │
          │  │  2. Build      │  │
          │  │  3. Push ECR   │  │
          │  │  4. Deploy EC2 │  │
          │  └───────────────┘  │
          └──────┬─────────┬────┘
                 │         │
    ┌────────────▼─┐   ┌───▼──────────────────┐
    │   AWS ECR    │   │      AWS EC2          │
    │              │   │                        │
    │ FE Image ────┼───►  Nginx (port 80)      │
    │ BE Image ────┘   │    ↓                   │
    │                  │  Frontend (port 3000)  │
    │                  │  Backend  (port 3001)  │
    │                  │  Database (port 5432)  │
    └──────────────┘   └────────────────────────┘
```

## 📁 Proje Yapısı

```
devops-task/
├── terraform/                 # AWS altyapısı
│   ├── main.tf               # EC2, ECR, IAM, Security Groups
│   ├── variables.tf          # Değişken tanımları
│   ├── outputs.tf            # IP, URL, key çıktıları
│   └── terraform.tfvars.example
├── frontend/                  # React uygulaması
│   ├── Dockerfile            # Multi-stage build
│   └── nginx.conf            # Container içi Nginx
├── backend/                   # Node.js Express API
│   └── Dockerfile            # Multi-stage build
├── nginx/
│   └── app.conf              # EC2 Nginx reverse proxy
├── docker-compose.yml         # 3 servisi birlikte çalıştırır
└── .github/
    └── workflows/
        └── deploy.yml        # CI/CD pipeline
```

## 🔧 Kurulum

### Gereksinimler

- AWS CLI (`aws --version`)
- Terraform >= 1.5.0 (`terraform --version`)
- Docker (`docker --version`)
- SSH key pair (`ls ~/.ssh/id_rsa.pub`)

### Adım 1: AWS CLI Konfigürasyonu

```bash
aws configure
# AWS Access Key ID: <your-key>
# AWS Secret Access Key: <your-secret>
# Default region: eu-central-1
# Default output format: json
```

### Adım 2: Terraform ile AWS Altyapısını Kur

```bash
cd terraform

# tfvars dosyasını oluştur
cp terraform.tfvars.example terraform.tfvars

# SSH public key'inizi ekleyin
echo "ssh_public_key = \"$(cat ~/.ssh/id_rsa.pub)\"" >> terraform.tfvars

# Terraform'u başlat
terraform init

# Planı gözden geçir (değiştirilecekler gösterilir)
terraform plan

# Altyapıyı oluştur
terraform apply -auto-approve

# Önemli çıktıları kaydet
terraform output ec2_public_ip
terraform output frontend_ecr_url
terraform output backend_ecr_url
terraform output -raw github_actions_secret_access_key
```

### Adım 3: GitHub Secrets Ayarla

GitHub Repository → Settings → Secrets and variables → Actions:

| Secret Adı | Değer | Nereden Alınır |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | `AKIA...` | `terraform output github_actions_access_key_id` |
| `AWS_SECRET_ACCESS_KEY` | `...` | `terraform output -raw github_actions_secret_access_key` |
| `EC2_HOST` | `1.2.3.4` | `terraform output ec2_public_ip` |
| `EC2_SSH_KEY` | SSH private key | `cat ~/.ssh/id_rsa` |
| `DB_PASSWORD` | güçlü şifre | Manuel belirleyin |
| `JWT_SECRET` | random string | `openssl rand -hex 32` |

### Adım 4: İlk Deploy

```bash
# main branch'e push et → GitHub Actions otomatik tetiklenir
git add .
git commit -m "feat: initial deploy"
git push origin main
```

GitHub Actions sekmesinden ilerlemeyi takip edin.

### Adım 5: Uygulamayı Doğrula

```bash
EC2_IP=$(cd terraform && terraform output -raw ec2_public_ip)

# HTTP kontrolü
curl http://$EC2_IP/health

# Tarayıcıda aç
echo "http://$EC2_IP"
```

## 🔒 Güvenlik Mimarisi

- **Security Group:** Sadece 80, 443, 22 portları dışarıya açık
- **DB:** Dışarıya kapalı, sadece internal Docker network üzerinden erişilebilir
- **BE:** Nginx üzerinden proxy — direkt port açık değil
- **Nginx:** Sadece frontend portunu dışarıya açar (görev gereksinimi)
- **IAM:** GitHub Actions kullanıcısı minimum izin (sadece ECR push)
- **EC2 IAM Role:** Sadece ECR read (pull için)

## 🔄 CI/CD Pipeline Akışı

```
Push → main
  ↓
[Test Job]
  npm ci → npm test
  ↓
[Build & Push Job]
  docker build frontend → ECR push (tag: git sha + latest)
  docker build backend  → ECR push (tag: git sha + latest)
  ↓
[Deploy Job]
  SCP: docker-compose.yml + nginx.conf → EC2
  SSH:
    aws ecr get-login-password → docker login
    .env dosyası oluştur
    docker-compose pull
    docker-compose up -d
    nginx -t && systemctl reload nginx
  Health check: curl /health → HTTP 200
```

## 🏗️ Terraform State Yönetimi (Üretim İçin)

Şu an state dosyası localde. Takım çalışması için S3 backend önerilir:

```bash
# S3 bucket oluştur
aws s3 mb s3://devops-task-tfstate-$(aws sts get-caller-identity --query Account --output text)

# DynamoDB tablosu (state lock için)
aws dynamodb create-table \
  --table-name terraform-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# main.tf'deki backend bloğunu uncomment edin ve tekrar init yapın
terraform init -migrate-state
```

## 🗑️ Kaynakları Temizle (Ücret Önlemek İçin)

```bash
cd terraform
terraform destroy -auto-approve
```

## 📊 Free Tier Kullanımı

| Kaynak | Free Tier Limiti | Bu Proje |
|---|---|---|
| EC2 t2.micro | 750 saat/ay | 1 instance |
| EBS | 30 GB/ay | 20 GB |
| ECR | 500 MB/ay | ~200 MB |
| Data Transfer | 15 GB/ay | Minimal |

## 🔧 Sorun Giderme

```bash
# EC2'ye bağlan
ssh -i ~/.ssh/id_rsa ubuntu@<EC2_IP>

# Container durumlarını kontrol et
docker-compose -f /opt/app/docker-compose.yml ps

# Logları gör
docker-compose -f /opt/app/docker-compose.yml logs -f

# Nginx durumu
sudo systemctl status nginx
sudo nginx -t

# User data logunu kontrol et
cat /var/log/user-data.log
```
