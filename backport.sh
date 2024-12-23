git reset HEAD~1
rm ./backport.sh
git cherry-pick b7950cd10e4383a06795703e1fb6368e884c19a0
echo 'Resolve conflicts and force push this branch'
