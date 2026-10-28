from app import store


class Use:
    def run(self, repo):
        repo.save()
        return self.Node
